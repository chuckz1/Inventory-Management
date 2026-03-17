/*
  parse.js

  Parses a raw voice command string into a structured command object.
  This module does NOT perform any backend calls or UI updates; it only
  extracts the intent (check in / check out / find) and the relevant values.
*/

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Parse a voice command into a structured object.
 *
 * @param {string} rawText - Raw speech transcript.
 * @returns {{
 *   type: "checkIn" | "checkOut" | "find" | "unknown",
 *   componentName: string | null,
 *   binLocation: string | null,
 *   raw: string
 * }}
 */
export function parseCommand(rawText) {
	if (typeof rawText !== "string") {
		return _unknown(rawText);
	}

	const text = rawText.trim().toLowerCase();
	if (!text) return _unknown(rawText);

	// Try each command type in order (most specific first)
	const parsed =
		_parseCheckIn(text) ||
		_parseCheckOut(text) ||
		_parseFind(text) ||
		_unknown(rawText);

	return { ...parsed, raw: rawText };
}

// -----------------------------------------------------------------------------
// Internal parsing helpers
// -----------------------------------------------------------------------------

const _checkInKeywords = ["check in", "checkin", "add", "store", "register"];

const _checkOutKeywords = [
	"check out",
	"checkout",
	"remove",
	"take out",
	"unregister",
];

const _findKeywords = ["find", "locate", "where is", "where's", "search for"];

function _parseCheckIn(text) {
	const keyword = _findKeyword(text, _checkInKeywords);
	if (!keyword) return null;

	const after = _afterKeyword(text, keyword);
	if (!after) return _unknown(text);

	const { componentName, binLocation } = _splitComponentAndBin(after);

	return {
		type: "checkIn",
		componentName,
		binLocation,
	};
}

function _parseCheckOut(text) {
	const keyword = _findKeyword(text, _checkOutKeywords);
	if (!keyword) return null;

	const after = _afterKeyword(text, keyword);
	if (!after) return _unknown(text);

	const { componentName, binLocation } = _splitComponentAndBin(after);

	return {
		type: "checkOut",
		componentName,
		binLocation,
	};
}

function _parseFind(text) {
	const keyword = _findKeyword(text, _findKeywords);
	if (!keyword) return null;

	const after = _afterKeyword(text, keyword);
	if (!after) return _unknown(text);

	return {
		type: "find",
		componentName: after,
		binLocation: null,
	};
}

function _findKeyword(text, keywords) {
	for (const keyword of keywords) {
		if (text.includes(keyword)) {
			return keyword;
		}
	}
	return null;
}

function _afterKeyword(text, keyword) {
	return text.slice(keyword.length).trim();
}

/**
 * Extracts componentName and binLocation from a phrase like "resistor 10k bin A1".
 *
 * Rules:
 * - If the phrase contains a "bin" marker ("bin", "in bin", "to bin", "into bin"),
 *   split on it.
 * - Otherwise, if there are 2+ words, assume the last word is the bin and the rest is the component.
 * - Otherwise, treat the entire phrase as a component name.
 */
function _splitComponentAndBin(phrase) {
	const binMarkers = [" bin ", " in bin ", " to bin ", " into bin "];

	for (const marker of binMarkers) {
		const idx = phrase.indexOf(marker);
		if (idx !== -1) {
			const componentName = phrase.slice(0, idx).trim();
			const binLocation = phrase.slice(idx + marker.length).trim();
			return {
				componentName: componentName || null,
				binLocation: binLocation || null,
			};
		}
	}

	const parts = phrase.split(" ").filter(Boolean);
	if (parts.length >= 2) {
		const binLocation = parts[parts.length - 1];
		const componentName = parts.slice(0, -1).join(" ");
		return { componentName, binLocation };
	}

	return { componentName: phrase || null, binLocation: null };
}

function _unknown(raw) {
	return {
		type: "unknown",
		componentName: null,
		binLocation: null,
		raw,
	};
}
