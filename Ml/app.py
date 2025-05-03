# --- Imports ---
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional, Literal, Union
import re
import string
import nltk
import os
import sys
import asyncio
import json
import traceback
import time
import hashlib
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import logging

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- NLTK Setup ---
nltk_data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nltk_data')
os.makedirs(nltk_data_dir, exist_ok=True)
nltk.data.path.append(nltk_data_dir)
try:
    nltk.data.find('tokenizers/punkt')
    logger.info("NLTK 'punkt' tokenizer found.")
except LookupError:
    logger.info("Downloading 'punkt' tokenizer...")
    nltk.download('punkt', download_dir=nltk_data_dir)
    nltk.data.find('tokenizers/punkt')

# --- Gemini Setup ---
GEMINI_API_KEY = "AIzaSyAyvahJXYciPiB7cnlmagzM5EDhw3tlBq8"
GEMINI_MODEL_NAME = "gemini-1.5-flash"

def initialize_gemini():
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        return genai.GenerativeModel(GEMINI_MODEL_NAME)
    except Exception as e:
        logger.error(f"Gemini init error: {e}")
        return None

gemini_model = initialize_gemini()

# --- FastAPI App ---
app = FastAPI(title="Smart Grievance Chatbot")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class UserMessage(BaseModel):
    session_id: str
    text: str
    language: Optional[str] = 'en'

class BotResponse(BaseModel):
    reply: str
    follow_up_question: Optional[str] = None
    suggested_actions: Optional[List[Union[str, Dict[str, str]]]] = None
    detected_intent: Optional[str] = None
    corrected_text: Optional[str] = None
    department: Optional[str] = None
    action: Optional[Literal['gather_info', 'confirm_info', 'trigger_registration', 'reset', 'post_registration']] = None
    complaint_data: Optional[Dict[str, Any]] = None
    complaint_ready: Optional[bool] = None

# --- In-Memory Session Storage ---
sessions: Dict[str, Dict[str, Any]] = {}

# --- Constants and Dictionaries ---
spelling_corrections = {
    "electisity": "electricity", "watter": "water", "potholse": "potholes",
    "strret": "street",
}
department_keywords = {
    "Electricity": ["electricity", "power", "light", "outage", "streetlight"],
    "Water": ["water", "pipe", "leak", "tap", "sewage"],
    "Roads": ["road", "pothole", "street", "traffic", "signal"],
    "Sanitation": ["garbage", "trash", "waste", "collection", "cleaning"],
    "Parks": ["park", "playground", "tree"],
    "Other": ["other", "general", "issue"]
}
intent_patterns = {
    "greeting": [r"\b(hi|hello|hey)\b"],
    "farewell": [r"\b(bye|goodbye|thanks|thank you)\b"],
    "status_check": [r"\b(status|update|tracking)\b"],
    "restart": [r"\b(start over|restart|reset)\b"],
    "help": [r"\b(help|assist|support)\b"],
    "cancel": [r"\b(cancel|stop|forget it)\b"],
    "confirmation_yes": [r"\b(yes|confirm|ok|okay|submit|register|proceed|correct|right|it's correct|that's right)\b"],
    "confirmation_no": [r"\b(no|wait|add|more|change|wrong|incorrect|cancel|not correct)\b"],
}

# --- Helper Functions ---
def get_session(session_id: str) -> Dict[str, Any]:
    if session_id not in sessions:
        logger.info(f"Creating new session: {session_id}")
        sessions[session_id] = {
            "step": "start",
            "data": {
                "department": None,
                "description": None,
                "address": None,
                "timing": None,
                "specific_details": "",
                "title": None
            },
            "conversation_history": [],
            "complaint_data_prepared": None,
            "last_bot_action": None,
        }
        initial_message = "Hello! I'm the Grievance Chatbot. Please describe the issue you're facing, including the location and when it started, if possible."
        sessions[session_id]["conversation_history"].append({"role": "bot", "text": initial_message})
        sessions[session_id]["last_bot_action"] = "gather_info"
    if "data" not in sessions[session_id]: sessions[session_id]["data"] = {}
    for key in ["department", "description", "address", "timing", "specific_details", "title"]:
        if key not in sessions[session_id]["data"]:
             sessions[session_id]["data"][key] = None if key not in ["specific_details"] else ""
    if "last_bot_action" not in sessions[session_id]: sessions[session_id]["last_bot_action"] = "gather_info"
    if "conversation_history" not in sessions[session_id]: sessions[session_id]["conversation_history"] = []

    return sessions[session_id]

def update_session(session_id: str, updates: Dict[str, Any]):
    if session_id in sessions:
        sessions[session_id].update(updates)
        logger.debug(f"Session {session_id} updated: {updates}")

def add_history(session_id: str, role: str, text: str):
    if session_id in sessions:
        history = sessions[session_id].get("conversation_history", [])
        if len(history) > 20:
            sessions[session_id]["conversation_history"] = history[-20:]
        sessions[session_id]["conversation_history"].append({"role": role, "text": text})

def reset_session(session_id: str):
    logger.info(f"Resetting session: {session_id}")
    if session_id in sessions:
        del sessions[session_id]
    return get_session(session_id)

def correct_spelling(text: str) -> str:
    words = text.lower().split()
    corrected_words = [spelling_corrections.get(word.strip(string.punctuation), word) for word in words]
    return ' '.join(corrected_words)

def recognize_intent(text: str) -> str:
    text_lower = text.lower()
    for intent, patterns in intent_patterns.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return intent
    return "unknown"

async def extract_and_assess_details(session_id: str, history: List[Dict[str, str]], current_query: str, current_data: Dict[str, Any]) -> Dict[str, Any]:
    """Uses Gemini to extract details, update data, infer department, and assess completeness."""
    if not gemini_model:
        logger.error(f"Session {session_id}: Gemini model not available for extraction.")
        return {"updated_data": current_data, "missing": ["department", "description", "address"], "assessment": "Gemini not available.", "next_question": "Could you please provide the department, description, and location?"}

    formatted_history = "\n".join([f"{entry['role'].capitalize()}: {entry['text']}" for entry in history])
    current_data_str = json.dumps(current_data, indent=2)

    core_fields = ["title", "department", "description", "address", "timing"]
    essential_fields = ["department", "description", "address"]
    other_details_field = "specific_details"
    all_fields = core_fields + [other_details_field]

    prompt = f"""Analyze the following conversation history and the latest user message for a municipal grievance report.

Current known data:
{current_data_str}

Conversation History:
{formatted_history}
User: {current_query}

Department Keywords Hint (use if helpful): {json.dumps(department_keywords)}

Tasks:
1.  **Extract/Update Data:** Based *only* on the history and latest message, provide the most likely values for the fields ({all_fields}).
    *   Infer the `department` based on the description/context. Only leave null if truly ambiguous.
    *   Generate a concise `title` (max 15 words) summarizing the issue if not explicitly given.
    *   Update fields if the new message contradicts or refines previous info.
    *   Output this as a JSON object under the key \"extracted_data\". Use null for fields not mentioned or unclear.
2.  **Identify Missing Core Info:** List the *core* fields ({core_fields}) that are still null or contain placeholder/unclear information in the *updated* data derived from task 1. Output this as a JSON list under the key \"missing_core_fields\".
3.  **Assess Plausibility:** Briefly assess if the provided \'description\' and \'address\' seem plausible for a municipal complaint. Output this as a string under the key \"plausibility_assessment\".
4.  **Suggest Next Question:** Based *only* on the \"missing_core_fields\" list from task 2:
    *   If the list is NOT empty, suggest the *single most important* question to ask the user to gather one of the missing core fields (prioritize department, description, address, then timing, then title).
    *   If the list IS empty (all core fields filled), suggest a specific, relevant question to gather more `{other_details_field}` based on the `department` and `description` (e.g., for Electricity/streetlight: 'Is the light flickering or completely out?'; for Sanitation/garbage: 'Is it a missed collection or overflowing bin?'). If no specific detail seems needed, suggest asking for confirmation.
    *   Output this as a string under the key \"next_question_suggestion\".

Respond *only* with a valid JSON object containing these four keys: \"extracted_data\", \"missing_core_fields\", \"plausibility_assessment\", \"next_question_suggestion\".
Example Output (missing timing):
{{
  \"extracted_data\": {{
    \"title\": \"Street light out at Main and Elm\",
    \"department\": \"Electricity\",
    \"description\": \"The street light at the corner of Main St and Elm St is not working.\",
    \"address\": \"Corner of Main St and Elm St\",
    \"timing\": null,
    \"specific_details\": null
  }},
  \"missing_core_fields\": [\"timing\"],
  \"plausibility_assessment\": \"Description and address seem plausible.\",
  \"next_question_suggestion\": \"When did you first notice the street light was out?\"
}}
Example Output (core complete, asking specific detail):
{{
  \"extracted_data\": {{
    \"title\": \"Pothole on Oak Avenue\",
    \"department\": \"Roads\",
    \"description\": \"There is a large pothole causing issues for traffic.\",
    \"address\": \"Approx 123 Oak Avenue, near the park entrance\",
    \"timing\": \"Appeared last week after the rain\",
    \"specific_details\": null
  }},
  \"missing_core_fields\": [],
  \"plausibility_assessment\": \"Description and address seem plausible.\",
  \"next_question_suggestion\": \"How large is the pothole, approximately?\"
}}
"""

    try:
        logger.info(f"Session {session_id}: Sending extraction prompt to Gemini.")
        response = await asyncio.to_thread(
            gemini_model.generate_content,
            prompt,
            generation_config={"temperature": 0.2, "response_mime_type": "application/json"},
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )

        if response.parts:
            response_text = response.text.strip()
            logger.debug(f"Session {session_id}: Gemini extraction raw response: {response_text}")
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                 response_text = response_text[3:-3].strip()

            try:
                analysis = json.loads(response_text)
                logger.info(f"Session {session_id}: Gemini analysis received: {analysis}")

                updated_data = current_data.copy()
                for key in all_fields:
                    if key not in updated_data:
                        updated_data[key] = None if key != other_details_field else ""
                extracted = analysis.get("extracted_data", {})
                if isinstance(extracted, dict):
                    for key in all_fields:
                        if key in extracted and extracted[key] is not None:
                            updated_data[key] = extracted[key]
                else:
                    logger.warning(f"Session {session_id}: Gemini extracted_data was not a dict: {extracted}")

                missing_core = analysis.get("missing_core_fields", core_fields)
                if not isinstance(missing_core, list):
                    logger.warning(f"Session {session_id}: Gemini missing_core_fields was not a list: {missing_core}")
                    missing_core = core_fields

                assessment = analysis.get("plausibility_assessment", "Assessment failed.")
                next_question = analysis.get("next_question_suggestion", "Could you please provide more details?")

                return {
                    "updated_data": updated_data,
                    "missing": missing_core,
                    "assessment": assessment,
                    "next_question": next_question
                }
            except json.JSONDecodeError as json_e:
                logger.error(f"Session {session_id}: Failed to parse Gemini JSON response: {json_e}\nRaw response: {response_text}")
                missing_fallback = [f for f in core_fields if not current_data.get(f)]
                return {"updated_data": current_data, "missing": missing_fallback, "assessment": "Failed to parse AI analysis.", "next_question": "Sorry, I had trouble understanding that. Could you rephrase?"}

        elif response.prompt_feedback.block_reason:
            logger.warning(f"Session {session_id}: Gemini extraction prompt blocked: {response.prompt_feedback.block_reason}")
            missing_fallback = [f for f in core_fields if not current_data.get(f)]
            return {"updated_data": current_data, "missing": missing_fallback, "assessment": "AI response blocked.", "next_question": "My response was blocked. Could you please rephrase?"}
        else:
             logger.error(f"Session {session_id}: Gemini extraction returned no parts.")
             missing_fallback = [f for f in core_fields if not current_data.get(f)]
             return {"updated_data": current_data, "missing": missing_fallback, "assessment": "AI analysis failed.", "next_question": "Sorry, I couldn't process that. Could you try again?"}

    except Exception as e:
        logger.error(f"Session {session_id}: Error during Gemini extraction: {e}", exc_info=True)
        missing_fallback = [f for f in core_fields if not current_data.get(f)]
        return {"updated_data": current_data, "missing": missing_fallback, "assessment": "Error during AI analysis.", "next_question": "Sorry, an error occurred. Could you rephrase?"}

async def generate_confirmation_summary(data: Dict[str, Any]) -> str:
    """Generates a confirmation summary string with updated fields."""
    summary = f"Okay, let's confirm the details I have:\n"
    summary += f"- Title: {data.get('title', 'Not specified')}\n"
    summary += f"- Department: {data.get('department', 'Not specified')}\n"
    summary += f"- Description: {data.get('description', 'Not specified')}\n"
    summary += f"- Location: {data.get('address', 'Not specified')}\n"
    if data.get('timing'): summary += f"- Timing: {data.get('timing')}\n"
    if data.get('specific_details'): summary += f"- Specific Details: {data.get('specific_details')}\n"
    summary += "\nIs this information correct and complete?"
    return summary

async def generate_ai_reply(session_id: str, history: List[Dict[str, str]], current_query: str, next_action_hint: str, data: Dict[str, Any], suggested_question: str) -> str:
    if not gemini_model:
        logger.error(f"Session {session_id}: Gemini model not available for reply generation.")
        return "I am currently unable to process requests fully. Please try again later."

    formatted_history = "\n".join([f"{entry['role'].capitalize()}: {entry['text']}" for entry in history])
    data_str = json.dumps(data, indent=2)

    if next_action_hint == "ask_next_question":
        task_description = f"Your primary goal is to ask the user the following question: '{suggested_question}'. Be polite and conversational. Acknowledge their last message briefly if appropriate."
    elif next_action_hint == "ask_confirmation":
        task_description = "All core details seem gathered. Briefly acknowledge the user's last message and ask them to confirm if the details are correct, or if they want to add/change anything. Do NOT include the summary details yourself; just ask for confirmation."
    elif next_action_hint == "clarify_confirmation":
        task_description = "The user provided an ambiguous confirmation response. Ask them to clearly confirm (e.g., 'Yes, submit') or deny/request changes (e.g., 'No, change details')."
    elif next_action_hint == "ask_change_details":
         task_description = "The user wants to change details (they said 'no' to confirmation). Ask them specifically what they would like to change or add."
    else:
        task_description = "Respond helpfully and conversationally to the user's latest message, keeping the context of the grievance report in mind. Keep the response concise."

    prompt = f"""You are a helpful and concise municipal grievance chatbot.

Current Complaint Data:
{data_str}

Conversation History:
{formatted_history}
User: {current_query}

Your Task: {task_description}

Response:"""

    try:
        logger.info(f"Session {session_id}: Sending generation prompt to Gemini (Hint: {next_action_hint}).")
        response = await asyncio.to_thread(
            gemini_model.generate_content,
            prompt,
            generation_config={"temperature": 0.7, "max_output_tokens": 150},
            safety_settings={
                 HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        if response.parts:
            reply_text = response.text.strip()
            logger.info(f"Session {session_id}: Gemini generated reply: {reply_text}")
            if next_action_hint == "ask_confirmation":
                summary = await generate_confirmation_summary(data)
                reply_text = f"{reply_text}\n\n{summary}"
            return reply_text
        elif response.prompt_feedback.block_reason:
            logger.warning(f"Session {session_id}: Gemini generation prompt blocked: {response.prompt_feedback.block_reason}")
            return "My response was blocked due to safety settings. Could you please rephrase?"
        else:
            logger.error(f"Session {session_id}: Gemini generation returned no parts.")
            return "Sorry, I couldn't generate a response. Could you try again?"

    except Exception as e:
        logger.error(f"Session {session_id}: Error during Gemini generation: {e}", exc_info=True)
        return "Sorry, an error occurred while generating my response."

async def handle_conversation(session_id: str, user_text: str, user_language: str = 'en') -> BotResponse:
    """Manages the conversation flow using Gemini for core logic."""
    session = get_session(session_id)
    history = session.get("conversation_history", [])
    current_data = session.get("data", {})
    if "specific_details" not in current_data: current_data["specific_details"] = ""
    if "title" not in current_data: current_data["title"] = None
    last_bot_action = session.get("last_bot_action", "gather_info")

    corrected_text = correct_spelling(user_text)
    detected_intent = recognize_intent(corrected_text)
    add_history(session_id, "user", user_text)

    if detected_intent == "restart":
        session = reset_session(session_id)
        initial_message = session["conversation_history"][0]["text"]
        return BotResponse(reply=initial_message, action="reset", suggested_actions=["Register Complaint", "Check Status"])
    if detected_intent == "cancel":
        reset_session(session_id)
        return BotResponse(reply="Okay, I've cancelled this complaint registration. Let me know if you need help with anything else.", action="reset")
    if detected_intent == "help":
        help_reply = "I can help you register a municipal complaint. Please describe the issue, location, and timing. Key details needed are the department, a description of the problem, and the address/location."
        add_history(session_id, "bot", help_reply)
        update_session(session_id, {"last_bot_action": "gather_info"})
        return BotResponse(reply=help_reply, action="gather_info")

    reply = "Processing..."
    action = "gather_info"
    suggestions = []
    complaint_data_for_frontend = None
    complaint_ready = False
    next_action_hint = "gather_info"
    suggested_question = ""

    logger.info(f"Session {session_id}: Current data before AI: {current_data}")
    analysis = await extract_and_assess_details(session_id, history, corrected_text, current_data)

    updated_data = analysis["updated_data"]
    missing_core_fields = analysis["missing"]
    suggested_question = analysis["next_question"]
    logger.info(f"Session {session_id}: Updated data after AI: {updated_data}")
    logger.info(f"Session {session_id}: Missing core fields: {missing_core_fields}")
    logger.info(f"Session {session_id}: AI assessment: {analysis['assessment']}")
    logger.info(f"Session {session_id}: AI suggested next question: {suggested_question}")

    update_session(session_id, {"data": updated_data})

    if last_bot_action == "confirm_info":
        if detected_intent == "confirmation_yes":
            logger.info(f"Session {session_id}: Confirmation received (Yes). Preparing data.")
            complaint_data_for_frontend = {
                "title": updated_data.get("title", f"Complaint: {updated_data.get('department', 'Issue')}")[:100],
                "department": updated_data.get("department"),
                "description": updated_data.get("description"),
                "additionalDetails": {
                    "location_details": updated_data.get("address"),
                    "issue_timing": updated_data.get("timing"),
                    "specific_details": updated_data.get("specific_details"),
                }
            }
            complaint_data_for_frontend["additionalDetails"] = {k: v for k, v in complaint_data_for_frontend["additionalDetails"].items() if v}
            if not complaint_data_for_frontend["additionalDetails"]:
                 del complaint_data_for_frontend["additionalDetails"]
            complaint_data_for_frontend = {k: v for k, v in complaint_data_for_frontend.items() if v}

            reply = "Okay, proceeding with registration..."
            action = "trigger_registration"
            complaint_ready = True
            session["complaint_data_prepared"] = complaint_data_for_frontend
            next_action_hint = "trigger_registration"

        elif detected_intent == "confirmation_no":
            logger.info(f"Session {session_id}: Confirmation received (No). Asking what to change.")
            next_action_hint = "ask_change_details"
            action = "gather_info"
            suggestions = ["Change Title", "Change Department", "Change Description", "Change Location", "Change Timing", "Change Specific Details"]
            reply = await generate_ai_reply(session_id, history, corrected_text, next_action_hint, updated_data, suggested_question)

        else:
            logger.info(f"Session {session_id}: Ambiguous confirmation. Asking for clarification.")
            next_action_hint = "clarify_confirmation"
            action = "confirm_info"
            suggestions = ["Yes, submit", "No, change details"]
            reply = await generate_ai_reply(session_id, history, corrected_text, next_action_hint, updated_data, suggested_question)

    elif missing_core_fields:
        logger.info(f"Session {session_id}: Core fields missing: {missing_core_fields}. Asking next question.")
        next_action_hint = "ask_next_question"
        action = "gather_info"
        if "department" in missing_core_fields and ("department" in suggested_question.lower() or "which department" in suggested_question.lower()):
            suggestions = list(department_keywords.keys())
        else:
            suggestions = []
        reply = await generate_ai_reply(session_id, history, corrected_text, next_action_hint, updated_data, suggested_question)

    else:
        is_confirm_question = "confirm" in suggested_question.lower()

        if not is_confirm_question:
            logger.info(f"Session {session_id}: Core complete. Asking specific detail: {suggested_question}")
            next_action_hint = "ask_next_question"
            action = "gather_info"
            suggestions = ["Skip this detail", "Confirm all details now"]
            reply = await generate_ai_reply(session_id, history, corrected_text, next_action_hint, updated_data, suggested_question)
        else:
            logger.info(f"Session {session_id}: Core complete. Asking for confirmation.")
            next_action_hint = "ask_confirmation"
            action = "confirm_info"
            suggestions = ["Yes, submit", "No, change details"]
            reply = await generate_ai_reply(session_id, history, corrected_text, next_action_hint, updated_data, suggested_question)

    update_session(session_id, {"last_bot_action": action})
    add_history(session_id, "bot", reply)

    response = BotResponse(
        reply=reply,
        suggested_actions=suggestions if suggestions else None,
        detected_intent=detected_intent,
        corrected_text=corrected_text if corrected_text != user_text else None,
        department=updated_data.get("department"),
        action=action,
        complaint_data=complaint_data_for_frontend,
        complaint_ready=complaint_ready
    )

    return response

@app.get("/")
async def root():
    return {"message": "Grievance Chatbot API is running"}

@app.post("/chat", response_model=BotResponse)
async def chat_endpoint_main(message: UserMessage):
    try:
        logger.info(f"Received chat message for session {message.session_id}: {message.text}")
        response = await handle_conversation(message.session_id, message.text, message.language)
        logger.info(f"Sending response for session {message.session_id}: Action={response.action}, Ready={response.complaint_ready}")
        return response
    except Exception as e:
        logger.error(f"Error during chat handling for session {message.session_id}: {e}", exc_info=True)
        try:
            reset_session(message.session_id)
        except Exception as reset_e:
             logger.error(f"Failed to reset session {message.session_id} after error: {reset_e}")
        return BotResponse(
            reply="I encountered an unexpected issue and had to reset our conversation. Please start again.",
            action="reset"
        )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server with Uvicorn...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")