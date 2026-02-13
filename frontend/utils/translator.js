'use client';

const translationCache = new Map();

// List of supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' }
];

/**
 * Translate text using free Google Translate API (unofficial endpoint)
 * Batches requests to minimize API calls
 */
export const translateText = async (text, targetLang = 'en', sourceLang = 'auto') => {
  if (!text || !text.trim() || targetLang === 'en') return text;

  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    // data[0] contains an array of translated segments
    let translated = '';
    if (data && data[0]) {
      for (const segment of data[0]) {
        if (segment[0]) translated += segment[0];
      }
    }

    if (translated) {
      translationCache.set(cacheKey, translated);
      return translated;
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

/**
 * Translate multiple texts in a single batch to reduce API calls
 */
export const translateBatch = async (texts, targetLang = 'en') => {
  if (!texts || texts.length === 0 || targetLang === 'en') return texts;

  const results = new Array(texts.length);
  const toTranslate = [];
  const toTranslateIndices = [];

  // Check cache first
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || !text.trim()) {
      results[i] = text;
      continue;
    }
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      results[i] = translationCache.get(cacheKey);
    } else {
      toTranslate.push(text);
      toTranslateIndices.push(i);
    }
  }

  if (toTranslate.length === 0) return results;

  // Batch translate using separator
  const SEPARATOR = '\n§§§\n';
  const batchSize = 30;

  for (let b = 0; b < toTranslate.length; b += batchSize) {
    const batch = toTranslate.slice(b, b + batchSize);
    const batchIndices = toTranslateIndices.slice(b, b + batchSize);
    const combined = batch.join(SEPARATOR);

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(combined)}`;
      const res = await fetch(url);
      const data = await res.json();

      let translated = '';
      if (data && data[0]) {
        for (const segment of data[0]) {
          if (segment[0]) translated += segment[0];
        }
      }

      const parts = translated.split(/\s*§§§\s*/);
      for (let j = 0; j < batchIndices.length; j++) {
        const original = batch[j];
        const trans = parts[j]?.trim() || original;
        results[batchIndices[j]] = trans;
        translationCache.set(`${original}_${targetLang}`, trans);
      }
    } catch (err) {
      console.error('Batch translation error:', err);
      for (let j = 0; j < batchIndices.length; j++) {
        results[batchIndices[j]] = batch[j];
      }
    }
  }

  return results;
};

/**
 * Translate all visible text nodes in the DOM
 */
export const translatePage = async (targetLang) => {
  if (targetLang === 'en') {
    // Restore original English text
    restoreOriginalText();
    return;
  }

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script, style, textarea, input elements
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'NOSCRIPT'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip empty/whitespace-only text
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        // Skip if parent has data-no-translate
        if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  const originalTexts = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    if (text.length > 0 && !/^[\d\s\-:/.+,@#$%^&*()=\[\]{}|\\<>!?;'"`~]+$/.test(text)) {
      // Store original text for restoration
      if (!node._originalText) {
        node._originalText = node.textContent;
      }
      textNodes.push(node);
      originalTexts.push(text);
    }
  }

  if (originalTexts.length === 0) return;

  // Translate in batch
  const translated = await translateBatch(originalTexts, targetLang);

  for (let i = 0; i < textNodes.length; i++) {
    if (translated[i] && translated[i] !== originalTexts[i]) {
      // Preserve leading/trailing whitespace from original
      const leading = textNodes[i]._originalText.match(/^\s*/)[0];
      const trailing = textNodes[i]._originalText.match(/\s*$/)[0];
      textNodes[i].textContent = leading + translated[i] + trailing;
    }
  }

  // Also translate placeholder attributes
  const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
  const placeholders = [];
  const placeholderEls = [];
  inputs.forEach(el => {
    if (!el._originalPlaceholder) {
      el._originalPlaceholder = el.placeholder;
    }
    if (el.placeholder.trim()) {
      placeholders.push(el.placeholder.trim());
      placeholderEls.push(el);
    }
  });

  if (placeholders.length > 0) {
    const translatedPlaceholders = await translateBatch(placeholders, targetLang);
    for (let i = 0; i < placeholderEls.length; i++) {
      if (translatedPlaceholders[i]) {
        placeholderEls[i].placeholder = translatedPlaceholders[i];
      }
    }
  }
};

/**
 * Restore all text nodes to their original English text
 */
const restoreOriginalText = () => {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node._originalText) {
      node.textContent = node._originalText;
    }
  }

  // Restore placeholders
  const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach(el => {
    if (el._originalPlaceholder) {
      el.placeholder = el._originalPlaceholder;
    }
  });
};

export const clearTranslationCache = () => {
  translationCache.clear();
};