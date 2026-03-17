/*
  backend.js

  Frontend helper for communicating with the backend (Google Apps Script Web App).
  This file exports three public functions:
    - checkInComponent(componentName, binLocation)
    - checkOutComponent(componentName)
    - getListOfComponents()

  The backend is expected to be a Google Apps Script Web App that exposes endpoints
  to add/remove/query inventory items.

  This module also includes a lightweight localStorage fallback so that the app can be
  developed/tested without a deployed backend.
*/

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

/**
 * Replace this with your deployed Google Apps Script Web App URL.
 * Example:
 *   https://script.google.com/macros/s/AKfycbxyz12345/exec
 */
export const BACKEND_WEB_APP_URL = ""; // <-- SET THIS!

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Checks in a component (adds it to the inventory).
 *
 * @param {string} componentName
 * @param {string} binLocation
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function checkInComponent(componentName, binLocation) {
	return await _callBackend("checkInComponent", { componentName, binLocation });
}

/**
 * Checks out a component (removes it from the inventory).
 *
 * @param {string} componentName
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function checkOutComponent(componentName) {
	return await _callBackend("checkOutComponent", { componentName });
}

/**
 * Gets the current list of checked-in components.
 *
 * @returns {Promise<Array<{componentName: string, binLocation: string}>>}
 */
export async function getListOfComponents() {
	const result = await _callBackend("getListOfComponents", {});
	return Array.isArray(result) ? result : [];
}

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

const _localStorageKey = "inventoryManagementInventory";

async function _callBackend(action, payload) {
	if (!BACKEND_WEB_APP_URL) {
		// Fallback to built-in localStorage-backed inventory for development.
		return _localBackend(action, payload);
	}

	const body = { action, ...payload };

	const response = await fetch(BACKEND_WEB_APP_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		cache: "no-store",
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(
			`Backend request failed (${response.status} ${response.statusText}): ${text}`,
		);
	}

	const json = await response.json();

	if (json?.success === false) {
		throw new Error(json.message || "Backend returned an error");
	}

	return json?.data ?? json;
}

function _localBackend(action, payload) {
	const list = _readLocalInventory();

	switch (action) {
		case "checkInComponent": {
			const { componentName, binLocation } = payload;
			const existingIndex = list.findIndex(
				(item) =>
					item.componentName.toLowerCase() === componentName.toLowerCase(),
			);

			if (existingIndex !== -1) {
				return {
					success: false,
					message: `Component "${componentName}" is already checked in (bin: ${list[existingIndex].binLocation}).`,
				};
			}

			list.push({ componentName, binLocation });
			_writeLocalInventory(list);
			return {
				success: true,
				message: `Checked in "${componentName}" to bin "${binLocation}".`,
			};
		}

		case "checkOutComponent": {
			const { componentName } = payload;
			const existingIndex = list.findIndex(
				(item) =>
					item.componentName.toLowerCase() === componentName.toLowerCase(),
			);

			if (existingIndex === -1) {
				return {
					success: false,
					message: `Component "${componentName}" is not checked in.`,
				};
			}

			list.splice(existingIndex, 1);
			_writeLocalInventory(list);

			return {
				success: true,
				message: `Checked out "${componentName}".`,
			};
		}

		case "getListOfComponents": {
			return list;
		}

		default: {
			return {
				success: false,
				message: `Unknown backend action: ${action}`,
			};
		}
	}
}

function _readLocalInventory() {
	try {
		const raw = localStorage.getItem(_localStorageKey);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

function _writeLocalInventory(list) {
	try {
		localStorage.setItem(_localStorageKey, JSON.stringify(list));
	} catch {
		// Ignore write errors (e.g., private mode).
	}
}
