import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List, Literal, Optional, Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import google.generativeai as genai
    from google.generativeai.types import HarmBlockThreshold, HarmCategory
except Exception:  # pragma: no cover - import failure handled at runtime
    genai = None
    HarmBlockThreshold = None
    HarmCategory = None


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(title="Smart Grievance Chatbot")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserMessage(BaseModel):
    session_id: str
    text: str
    language: Optional[str] = "en"


class BotResponse(BaseModel):
    reply: str
    follow_up_question: Optional[str] = None
    suggested_actions: Optional[List[Union[str, Dict[str, str]]]] = None
    detected_intent: Optional[str] = None
    corrected_text: Optional[str] = None
    department: Optional[str] = None
    action: Optional[
        Literal[
            "gather_info",
            "confirm_info",
            "trigger_registration",
            "reset",
            "post_registration",
        ]
    ] = None
    complaint_data: Optional[Dict[str, Any]] = None
    complaint_ready: Optional[bool] = None


sessions: Dict[str, Dict[str, Any]] = {}

DATA_KEYS = ["department", "description", "address", "timing", "specific_details", "title"]
DEPARTMENT_OPTIONS = ["Electricity", "Water", "Roads", "Sanitation", "Parks", "Other"]
REQUIRED_FIELDS = ["department", "description", "address", "timing", "specific_details"]

SPELLING_CORRECTIONS = {
    "electisity": "electricity",
    "watter": "water",
    "potholse": "potholes",
    "strret": "street",
    "deaprtment": "department",
    "folllow": "follow",
    "follup": "follow up",
}

FIELD_QUESTIONS = {
    "department": "Which department should handle this issue? Choose Electricity, Water, Roads, Sanitation, Parks, or Other.",
    "description": "Please describe the issue clearly so the department can understand the exact problem.",
    "address": "Please share the exact address or landmark where this issue is happening.",
    "timing": "When did this issue start or when did you last observe it?",
    "specific_details": "Please share one more specific detail (severity, size, frequency, or impact).",
}

STATUS_PATTERNS = {
    "greeting": [r"\b(hi|hello|hey)\b"],
    "farewell": [r"\b(bye|goodbye|thanks|thank you)\b"],
    "status_check": [r"\b(status|update|tracking|track)\b"],
    "restart": [r"\b(start over|restart|reset|new complaint)\b"],
    "help": [r"\b(help|assist|support)\b"],
    "cancel": [r"\b(cancel|stop|forget it|drop this)\b"],
}

YES_PATTERN = re.compile(
    r"\b(yes|yup|yeah|ok|okay|confirm|submit|proceed|correct|right|go ahead)\b"
)
NO_PATTERN = re.compile(r"\b(no|nope|wrong|incorrect|change|edit|not correct)\b")

INVALID_VALUES = {"", "unknown", "none", "null", "n/a", "na", "not provided"}

_gemini_model = None
_gemini_error = None


def _safe_lower(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _clean_text(text: Optional[str]) -> Optional[str]:
    if text is None:
        return None
    cleaned = re.sub(r"\s+", " ", str(text)).strip(" \t\n\r,.-")
    return cleaned or None


def _meaningful(value: Optional[str]) -> bool:
    if value is None:
        return False
    cleaned = _safe_lower(str(value))
    return cleaned not in INVALID_VALUES


def _normalize_department(value: Optional[str]) -> Optional[str]:
    if not _meaningful(value):
        return None
    candidate = _clean_text(value)
    if not candidate:
        return None

    for option in DEPARTMENT_OPTIONS:
        if candidate.lower() == option.lower():
            return option

    lowered = candidate.lower()
    keyword_map = {
        "electric": "Electricity",
        "power": "Electricity",
        "water": "Water",
        "sewage": "Water",
        "road": "Roads",
        "street": "Roads",
        "garbage": "Sanitation",
        "waste": "Sanitation",
        "park": "Parks",
        "tree": "Parks",
    }
    for keyword, department in keyword_map.items():
        if keyword in lowered:
            return department

    return "Other"


def correct_spelling(text: str) -> str:
    def replace_word(match: re.Match) -> str:
        word = match.group(0)
        replacement = SPELLING_CORRECTIONS.get(word.lower())
        if not replacement:
            return word
        if word.isupper():
            return replacement.upper()
        if word[0].isupper():
            return replacement.capitalize()
        return replacement

    return re.sub(r"[A-Za-z]+", replace_word, text)


def recognize_intent(text: str) -> str:
    lowered = _safe_lower(text)
    for intent, patterns in STATUS_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, lowered):
                return intent

    if is_confirmation_yes(lowered):
        return "confirmation_yes"
    if is_confirmation_no(lowered):
        return "confirmation_no"

    yes_match = bool(YES_PATTERN.search(lowered))
    no_match = bool(NO_PATTERN.search(lowered))
    if yes_match and not no_match:
        if len(lowered.split()) <= 4:
            return "confirmation_yes"
    if no_match and not yes_match:
        if len(lowered.split()) <= 4:
            return "confirmation_no"

    return "unknown"


def is_confirmation_yes(lowered_text: str) -> bool:
    explicit = {
        "yes",
        "yes submit",
        "y",
        "ok",
        "okay",
        "confirm",
        "submit",
        "proceed",
        "go ahead",
        "correct",
    }
    if lowered_text in explicit:
        return True
    if re.match(r"^(yes|yup|yeah)\s*(,|$)", lowered_text):
        return True
    if re.search(r"\b(yes,?\s*submit|confirm and submit)\b", lowered_text):
        return True
    return False


def is_confirmation_no(lowered_text: str) -> bool:
    explicit = {
        "no",
        "nope",
        "wrong",
        "incorrect",
        "change",
        "edit",
        "not correct",
        "no change this",
    }
    if lowered_text in explicit:
        return True
    if re.match(r"^(no|nope)\s*(,|$)", lowered_text):
        return True
    if re.search(r"\b(no,?\s*change details|change details)\b", lowered_text):
        return True
    return False


def get_session(session_id: str) -> Dict[str, Any]:
    if session_id not in sessions:
        logger.info("Creating new session: %s", session_id)
        sessions[session_id] = {
            "data": {
                "department": None,
                "description": None,
                "address": None,
                "timing": None,
                "specific_details": None,
                "title": None,
            },
            "conversation_history": [],
            "last_bot_action": "gather_info",
            "awaiting_field": None,
            "complaint_data_prepared": None,
            "warned_missing_key": False,
        }
        welcome = (
            "Hello! I can register your complaint. Please describe your issue, location, and when it started."
        )
        sessions[session_id]["conversation_history"].append({"role": "bot", "text": welcome})

    session = sessions[session_id]
    if "data" not in session:
        session["data"] = {}
    for key in DATA_KEYS:
        if key not in session["data"]:
            session["data"][key] = None
    if "conversation_history" not in session:
        session["conversation_history"] = []
    if "last_bot_action" not in session:
        session["last_bot_action"] = "gather_info"
    if "awaiting_field" not in session:
        session["awaiting_field"] = None
    if "warned_missing_key" not in session:
        session["warned_missing_key"] = False

    return session


def reset_session(session_id: str) -> Dict[str, Any]:
    logger.info("Resetting session: %s", session_id)
    if session_id in sessions:
        del sessions[session_id]
    return get_session(session_id)


def add_history(session_id: str, role: str, text: str) -> None:
    if session_id not in sessions:
        return

    history = sessions[session_id].get("conversation_history", [])
    if len(history) >= 50:
        sessions[session_id]["conversation_history"] = history[-49:]
    sessions[session_id]["conversation_history"].append({"role": role, "text": text})


def missing_fields(data: Dict[str, Any]) -> List[str]:
    missing: List[str] = []
    for field in REQUIRED_FIELDS:
        if not _meaningful(data.get(field)):
            missing.append(field)
    return missing


def generate_title(data: Dict[str, Any]) -> str:
    existing_title = _clean_text(data.get("title"))
    if existing_title:
        return existing_title[:100]

    department = _clean_text(data.get("department")) or "General"
    description = _clean_text(data.get("description")) or "Municipal complaint"
    title = f"{department}: {' '.join(description.split()[:10])}"
    return title[:100]


def confirmation_summary(data: Dict[str, Any]) -> str:
    lines = [
        "Please confirm the details:",
        f"- Title: {generate_title(data)}",
        f"- Department: {_clean_text(data.get('department')) or 'Not specified'}",
        f"- Description: {_clean_text(data.get('description')) or 'Not specified'}",
        f"- Location: {_clean_text(data.get('address')) or 'Not specified'}",
        f"- Timing: {_clean_text(data.get('timing')) or 'Not specified'}",
        f"- Specific Details: {_clean_text(data.get('specific_details')) or 'Not specified'}",
        "",
        "Is this information correct and complete?",
    ]
    return "\n".join(lines)


def build_complaint_data(data: Dict[str, Any]) -> Dict[str, Any]:
    complaint = {
        "title": generate_title(data),
        "department": _normalize_department(data.get("department")) or "Other",
        "description": _clean_text(data.get("description")) or "Issue reported via chatbot",
        "additionalDetails": {
            "location_details": _clean_text(data.get("address")) or "Location not specified",
            "issue_timing": _clean_text(data.get("timing")),
            "specific_details": _clean_text(data.get("specific_details")),
        },
    }

    complaint["additionalDetails"] = {
        k: v for k, v in complaint["additionalDetails"].items() if _meaningful(v)
    }
    if not complaint["additionalDetails"]:
        del complaint["additionalDetails"]

    return complaint


def _extract_json_object(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None

    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?", "", stripped).strip()
        stripped = re.sub(r"```$", "", stripped).strip()

    try:
        parsed = json.loads(stripped)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = stripped.find("{")
    end = stripped.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = stripped[start : end + 1]
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            return None

    return None


def _format_history_for_prompt(history: List[Dict[str, str]], limit: int = 14) -> str:
    recent = history[-limit:]
    lines = []
    for item in recent:
        role = item.get("role", "user").capitalize()
        text = item.get("text", "")
        lines.append(f"{role}: {text}")
    return "\n".join(lines)


def _gemini_api_key() -> Optional[str]:
    return (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GOOGLE_GEMINI_API_KEY")
    )


def _load_api_key_from_env_files() -> None:
    if _gemini_api_key():
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, ".env"),
        os.path.join(base_dir, "..", "backend", ".env"),
    ]

    for env_file in candidates:
        if not os.path.exists(env_file):
            continue
        try:
            with open(env_file, "r", encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip("'\"")
                    if key in {"GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY"} and value:
                        os.environ[key] = value
                        logger.info("Loaded Gemini API key from %s", env_file)
                        return
        except Exception:
            logger.exception("Failed reading env file: %s", env_file)


def get_gemini_model():
    global _gemini_model, _gemini_error

    if _gemini_model is not None:
        return _gemini_model

    if genai is None:
        _gemini_error = "google-generativeai package is not installed"
        return None

    _load_api_key_from_env_files()
    api_key = _gemini_api_key()
    if not api_key:
        _gemini_error = "GEMINI_API_KEY is missing"
        return None

    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    try:
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel(model_name)
        logger.info("Gemini model initialized: %s", model_name)
        return _gemini_model
    except Exception as exc:
        _gemini_error = str(exc)
        logger.exception("Failed to initialize Gemini model")
        return None


async def _generate_gemini_json(prompt: str) -> Optional[Dict[str, Any]]:
    model = get_gemini_model()
    if not model:
        return None

    safety_settings = None
    if HarmCategory and HarmBlockThreshold:
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }

    for attempt in range(1, 4):
        try:
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config={
                    "temperature": 0.15,
                    "response_mime_type": "application/json",
                    "max_output_tokens": 600,
                },
                safety_settings=safety_settings,
            )
            text = getattr(response, "text", "")
            parsed = _extract_json_object(text)
            if parsed:
                return parsed
            logger.warning("Gemini JSON parse failed (attempt %s)", attempt)
        except Exception:
            logger.exception("Gemini request failed (attempt %s)", attempt)

    return None


def _fallback_extract(data: Dict[str, Any], user_text: str) -> Dict[str, Any]:
    updated = dict(data)
    text = _clean_text(user_text)
    lowered = _safe_lower(user_text)

    if not _meaningful(updated.get("description")) and _meaningful(text):
        updated["description"] = text

    if not _meaningful(updated.get("department")):
        fallback_keywords = {
            "Electricity": ["electric", "power", "street light", "outage"],
            "Water": ["water", "leak", "sewage", "drain"],
            "Roads": ["pothole", "road", "street", "traffic signal"],
            "Sanitation": ["garbage", "waste", "trash", "cleaning"],
            "Parks": ["park", "playground", "tree", "garden"],
        }
        for dep, keys in fallback_keywords.items():
            if any(k in lowered for k in keys):
                updated["department"] = dep
                break

    if not _meaningful(updated.get("address")):
        address_match = re.search(
            r"\b(?:at|in|near|on|around|beside|behind|opposite)\s+([a-z0-9][a-z0-9 ,/#\-.]{5,})",
            lowered,
            flags=re.IGNORECASE,
        )
        if address_match:
            updated["address"] = _clean_text(address_match.group(1))

    if not _meaningful(updated.get("timing")):
        timing_match = re.search(
            r"\b(for\s+\d+\s+(?:hour|hours|day|days|week|weeks|month|months)|since\s+[a-z0-9 ,:-]+|today|yesterday|last\s+week)\b",
            lowered,
            flags=re.IGNORECASE,
        )
        if timing_match:
            updated["timing"] = _clean_text(timing_match.group(1))

    if not _meaningful(updated.get("specific_details")) and _meaningful(text) and len(text.split()) >= 5:
        updated["specific_details"] = text

    updated["department"] = _normalize_department(updated.get("department"))
    updated["title"] = generate_title(updated)

    missing = missing_fields(updated)
    next_field = missing[0] if missing else None
    next_question = FIELD_QUESTIONS.get(next_field) if next_field else "confirmation_ready"

    return {
        "updated_data": updated,
        "missing_fields": missing,
        "next_question": next_question,
        "assistant_ack": "Got it.",
    }


async def analyze_with_gemini(
    session: Dict[str, Any], user_text: str, corrected_text: str
) -> Dict[str, Any]:
    data = session.get("data", {})
    history = session.get("conversation_history", [])
    awaiting_field = session.get("awaiting_field")

    prompt = f"""
You are an expert municipal complaint intake assistant.

Goal:
Extract and refine complaint details from the ongoing conversation.
Ask focused follow-up questions until ALL required fields are collected.

Allowed department values only: {json.dumps(DEPARTMENT_OPTIONS)}
Required fields (must be non-empty): {json.dumps(REQUIRED_FIELDS)}
All fields: {json.dumps(DATA_KEYS)}

Current complaint data JSON:
{json.dumps(data, ensure_ascii=True)}

Conversation history (latest first):
{_format_history_for_prompt(history)}

Latest user message:
{corrected_text}

If awaiting_field is set, prioritize filling it first.
awaiting_field={awaiting_field}

Return ONLY valid JSON with this schema:
{{
  "extracted_data": {{
    "department": "... or null",
    "description": "... or null",
    "address": "... or null",
    "timing": "... or null",
    "specific_details": "... or null",
    "title": "... or null"
  }},
  "missing_fields": ["department", "description"],
  "next_question": "single direct question to gather next missing field, or 'confirmation_ready'",
  "assistant_ack": "one short polite sentence acknowledging user input"
}}

Rules:
- Department must be one of allowed values; else set null.
- If user updates/corrects old information, overwrite with latest info.
- Keep description concise and factual.
- next_question must target only one field at a time.
- If all required fields are present, set next_question to "confirmation_ready".
- Never include markdown or extra text outside JSON.
"""

    parsed = await _generate_gemini_json(prompt)
    if not parsed:
        return _fallback_extract(data, user_text)

    extracted = parsed.get("extracted_data", {})
    if not isinstance(extracted, dict):
        extracted = {}

    updated = dict(data)
    for key in DATA_KEYS:
        incoming = _clean_text(extracted.get(key))
        if not _meaningful(incoming):
            continue
        if key == "department":
            normalized = _normalize_department(incoming)
            if normalized:
                updated[key] = normalized
        else:
            updated[key] = incoming

    # if field was explicitly requested and user gave content, keep it even when model misses
    if awaiting_field and not _meaningful(updated.get(awaiting_field)):
        raw = _clean_text(corrected_text)
        if _meaningful(raw):
            if awaiting_field == "department":
                updated["department"] = _normalize_department(raw)
            else:
                updated[awaiting_field] = raw

    updated["department"] = _normalize_department(updated.get("department"))
    updated["title"] = generate_title(updated)

    computed_missing = missing_fields(updated)

    reported_missing = parsed.get("missing_fields", [])
    if not isinstance(reported_missing, list):
        reported_missing = []
    reported_missing = [f for f in reported_missing if f in REQUIRED_FIELDS]

    final_missing = computed_missing
    if set(reported_missing) and len(reported_missing) > len(computed_missing):
        final_missing = sorted(set(computed_missing).union(set(reported_missing)), key=REQUIRED_FIELDS.index)

    next_question = _clean_text(parsed.get("next_question"))
    if not next_question:
        field = final_missing[0] if final_missing else None
        next_question = FIELD_QUESTIONS.get(field, "confirmation_ready")

    ack = _clean_text(parsed.get("assistant_ack")) or "Understood."

    return {
        "updated_data": updated,
        "missing_fields": final_missing,
        "next_question": next_question,
        "assistant_ack": ack,
    }


def should_fast_track_submission(text: str) -> bool:
    lowered = _safe_lower(text)
    return "confirm all details now" in lowered or lowered == "skip"


async def handle_conversation(session_id: str, user_text: str, user_language: str = "en") -> BotResponse:
    del user_language

    session = get_session(session_id)
    data = session["data"]
    last_action = session.get("last_bot_action", "gather_info")

    corrected_text = correct_spelling(user_text)
    intent = recognize_intent(corrected_text)
    add_history(session_id, "user", user_text)

    if intent == "restart":
        refreshed = reset_session(session_id)
        initial_message = refreshed["conversation_history"][0]["text"]
        add_history(session_id, "bot", initial_message)
        return BotResponse(
            reply=initial_message,
            action="reset",
            suggested_actions=["Register Complaint", "Check Status"],
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
        )

    if intent == "cancel":
        reset_session(session_id)
        reply = "Okay, I cancelled this complaint registration. You can start a new one anytime."
        add_history(session_id, "bot", reply)
        return BotResponse(
            reply=reply,
            action="reset",
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
            complaint_ready=False,
        )

    if intent == "help":
        reply = (
            "I will collect full complaint details step by step: department, issue, location, timing, and specific impact. "
            "Please describe your issue to begin."
        )
        session["last_bot_action"] = "gather_info"
        session["awaiting_field"] = None
        add_history(session_id, "bot", reply)
        return BotResponse(
            reply=reply,
            action="gather_info",
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
            department=data.get("department"),
            complaint_ready=False,
        )

    if intent == "status_check":
        reply = "This chatbot is for new complaint registration. To track status, use your complaint number on the tracking page."
        add_history(session_id, "bot", reply)
        return BotResponse(
            reply=reply,
            action="gather_info",
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
            department=data.get("department"),
            complaint_ready=False,
        )

    if intent == "greeting" and not _meaningful(data.get("description")):
        reply = "Hello. Please describe your issue, location, and when it started."
        add_history(session_id, "bot", reply)
        return BotResponse(
            reply=reply,
            action="gather_info",
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
            department=data.get("department"),
            complaint_ready=False,
        )

    if last_action == "confirm_info":
        if intent == "confirmation_yes":
            complaint = build_complaint_data(data)
            session["complaint_data_prepared"] = complaint
            session["last_bot_action"] = "trigger_registration"
            session["awaiting_field"] = None
            reply = "Okay, proceeding with registration."
            add_history(session_id, "bot", reply)
            return BotResponse(
                reply=reply,
                detected_intent=intent,
                corrected_text=corrected_text if corrected_text != user_text else None,
                department=data.get("department"),
                action="trigger_registration",
                complaint_data=complaint,
                complaint_ready=True,
            )

        if intent == "confirmation_no":
            session["last_bot_action"] = "gather_info"
            session["awaiting_field"] = None
            reply = "Sure, tell me exactly what you want to change."
            add_history(session_id, "bot", reply)
            return BotResponse(
                reply=reply,
                detected_intent=intent,
                corrected_text=corrected_text if corrected_text != user_text else None,
                department=data.get("department"),
                action="gather_info",
                complaint_ready=False,
            )

        session["last_bot_action"] = "gather_info"

    analysis = await analyze_with_gemini(session, user_text, corrected_text)
    session["data"] = analysis["updated_data"]
    data = session["data"]
    missing = analysis["missing_fields"]

    # transparent hint for free-tier configuration if Gemini not active
    if get_gemini_model() is None and not session.get("warned_missing_key"):
        session["warned_missing_key"] = True
        logger.warning("Gemini is not active: %s", _gemini_error)

    if should_fast_track_submission(corrected_text):
        if missing:
            field = missing[0]
            question = FIELD_QUESTIONS.get(field, "Please share the missing detail.")
            session["awaiting_field"] = field
            session["last_bot_action"] = "gather_info"
            reply = f"{analysis['assistant_ack']} {question}".strip()
            add_history(session_id, "bot", reply)
            return BotResponse(
                reply=reply,
                follow_up_question=question,
                suggested_actions=DEPARTMENT_OPTIONS if field == "department" else None,
                detected_intent=intent,
                corrected_text=corrected_text if corrected_text != user_text else None,
                department=data.get("department"),
                action="gather_info",
                complaint_ready=False,
            )

        complaint = build_complaint_data(data)
        session["complaint_data_prepared"] = complaint
        session["last_bot_action"] = "trigger_registration"
        session["awaiting_field"] = None
        reply = "I will submit your complaint with the provided details. Proceeding with registration."
        add_history(session_id, "bot", reply)
        return BotResponse(
            reply=reply,
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
            department=data.get("department"),
            action="trigger_registration",
            complaint_data=complaint,
            complaint_ready=True,
        )

    if missing:
        field = missing[0]
        next_question = analysis.get("next_question")
        if not _meaningful(next_question) or next_question == "confirmation_ready":
            next_question = FIELD_QUESTIONS.get(field, "Please share the missing detail.")

        session["awaiting_field"] = field
        session["last_bot_action"] = "gather_info"
        suggestions = None
        if field == "department":
            suggestions = DEPARTMENT_OPTIONS
        elif field == "timing":
            suggestions = ["Today", "Yesterday", "Since last week", "Not sure"]

        reply = f"{analysis['assistant_ack']} {next_question}".strip()
        add_history(session_id, "bot", reply)
        return BotResponse(
            reply=reply,
            follow_up_question=next_question,
            suggested_actions=suggestions,
            detected_intent=intent,
            corrected_text=corrected_text if corrected_text != user_text else None,
            department=data.get("department"),
            action="gather_info",
            complaint_ready=False,
        )

    summary = confirmation_summary(data)
    session["awaiting_field"] = None
    session["last_bot_action"] = "confirm_info"
    reply = f"{analysis['assistant_ack']}\n\n{summary}".strip()
    add_history(session_id, "bot", reply)
    return BotResponse(
        reply=reply,
        follow_up_question="Is this information correct and complete?",
        suggested_actions=["Yes, submit", "No, change details"],
        detected_intent=intent,
        corrected_text=corrected_text if corrected_text != user_text else None,
        department=data.get("department"),
        action="confirm_info",
        complaint_ready=False,
    )


@app.get("/")
async def root() -> Dict[str, str]:
    if get_gemini_model() is None:
        message = "Grievance Chatbot API is running (Gemini inactive: set GEMINI_API_KEY)"
    else:
        message = "Grievance Chatbot API is running"
    return {"message": message}


@app.post("/chat", response_model=BotResponse)
async def chat_endpoint_main(message: UserMessage) -> BotResponse:
    try:
        logger.info("Received chat message for session %s", message.session_id)
        response = await handle_conversation(message.session_id, message.text, message.language)
        logger.info(
            "Sending response for session %s: action=%s ready=%s",
            message.session_id,
            response.action,
            response.complaint_ready,
        )
        return response
    except Exception:
        logger.exception("Error during chat handling for session %s", message.session_id)
        try:
            reset_session(message.session_id)
        except Exception:
            logger.exception("Failed to reset session %s after error", message.session_id)
        return BotResponse(
            reply="I encountered an unexpected issue and reset the conversation. Please start again.",
            action="reset",
            complaint_ready=False,
        )


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting FastAPI server with Uvicorn")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
