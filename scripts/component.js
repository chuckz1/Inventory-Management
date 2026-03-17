/*
  component.js

  Manages an in-memory inventory list and provides component-name utilities.
  This is intended to be a lightweight helper for the frontend UI.

  Public API:
    - setComponentList(list)
    - verifyComponentName(componentName)
    - findComponentBin(componentName)
    - findFuzzyComponent(fuzzyName)
*/

let _components = [];

function _normalize(text) {
	return (text || "").trim().toLowerCase();
}

/**
 * Replace the current component list.
 * @param {Array<{componentName: string, binLocation: string}>} list
 */
export function setComponentList(list) {
	if (!Array.isArray(list)) return;
	_components = list
		.filter((item) => item && item.componentName)
		.map((item) => ({
			componentName: String(item.componentName).trim(),
			binLocation: String(item.binLocation ?? "").trim(),
		}));
}

/**
 * Returns true if the component name exists in the current list (case-insensitive).
 * @param {string} componentName
 * @returns {boolean}
 */
export function verifyComponentName(componentName) {
	const name = _normalize(componentName);
	if (!name) return false;
	return _components.some((item) => _normalize(item.componentName) === name);
}

/**
 * Returns the bin location for a component, or null if not found.
 * @param {string} componentName
 * @returns {string | null}
 */
export function findComponentBin(componentName) {
	const name = _normalize(componentName);
	if (!name) return null;
	const found = _components.find(
		(item) => _normalize(item.componentName) === name,
	);
	return found ? found.binLocation : null;
}

/**
 * Returns the best fuzzy match for a given name, or null if no match is close enough.
 * Uses a simple Levenshtein distance algorithm.
 *
 * @param {string} fuzzyName
 * @returns {{componentName: string, binLocation: string} | null}
 */
export function findFuzzyComponent(fuzzyName) {
	const target = _normalize(fuzzyName);
	if (!target) return null;

	let best = null;
	let bestScore = Infinity;

	for (const item of _components) {
		const candidate = _normalize(item.componentName);
		const distance = _levenshtein(target, candidate);
		if (distance < bestScore) {
			bestScore = distance;
			best = item;
		}
	}

	// only return if match is reasonably close (tunable threshold)
	// example: allow up to ~40% of the length as edits.
	if (!best || bestScore > Math.max(1, target.length * 0.4)) {
		return null;
	}

	return best;
}

function _levenshtein(a, b) {
	const alen = a.length;
	const blen = b.length;
	if (alen === 0) return blen;
	if (blen === 0) return alen;

	const matrix = Array.from({ length: alen + 1 }, () =>
		Array(blen + 1).fill(0),
	);

	for (let i = 0; i <= alen; i++) matrix[i][0] = i;
	for (let j = 0; j <= blen; j++) matrix[0][j] = j;

	for (let i = 1; i <= alen; i++) {
		for (let j = 1; j <= blen; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost,
			);
		}
	}

	return matrix[alen][blen];
}
