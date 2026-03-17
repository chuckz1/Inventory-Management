/*
  voice.js

  Handles voice recognition + synthesis and routes parsed intent to the backend.
  This script registers the click handler for the "listen" button.

  Expected page structure:
    <button id="listen">🎤 Listen</button>
    <div id="output"></div>

  This module assumes the following modules are available (either via <script type="module"> imports
  or attached to window):
    - parseCommand(text)
    - checkInComponent(componentName, binLocation)
    - checkOutComponent(componentName)
    - getListOfComponents()
*/

import { parseCommand } from "./parse.js";
import {
	checkInComponent,
	checkOutComponent,
	getListOfComponents,
} from "./backend.js";
import {
	setComponentList,
	findComponentBin,
	findFuzzyComponent,
	verifyComponentName,
} from "./component.js";

const button = document.getElementById("listen");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output") || statusEl;

let recognition;

function _log(...args) {
	console.log("[voice]", ...args);
}

function _setOutput(text) {
	if (outputEl) outputEl.innerText = text;
	if (statusEl) statusEl.style.color = "var(--muted)";
}

function _speak(text) {
	if (!window.speechSynthesis) {
		_log("Speech synthesis not supported");
		return;
	}
	const utterance = new SpeechSynthesisUtterance(text);
	window.speechSynthesis.speak(utterance);
}

function _ensureRecognition() {
	if (recognition) return;

	const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	if (!SpeechRecognition) {
		throw new Error("SpeechRecognition is not supported in this browser.");
	}

	recognition = new SpeechRecognition();
	recognition.continuous = false;
	recognition.lang = "en-US";

	recognition.onresult = (event) => {
		const transcript = event.results[0][0].transcript.trim();
		_log("transcript:", transcript);
		_setOutput(transcript);
		_handleTranscript(transcript);
	};

	recognition.onerror = (event) => {
		_log("recognition error", event.error);
		_setOutput(`Error: ${event.error}`);
		_speak("Sorry, I couldn't hear that. Please try again.");
	};

	recognition.onend = () => {
		if (button) button.disabled = false;
	};
}

async function _handleTranscript(transcript) {
	const parsed = parseCommand(transcript);

	switch (parsed.type) {
		case "checkIn":
			await _handleCheckIn(parsed);
			break;
		case "checkOut":
			await _handleCheckOut(parsed);
			break;
		case "find":
			await _handleFind(parsed);
			break;
		default:
			_speak("Sorry, I didn't understand that command.");
			break;
	}
}

async function _handleCheckIn({ componentName, binLocation }) {
	if (!componentName || !binLocation) {
		_speak("To check in, please say something like: check in resistor A1.");
		return;
	}

	try {
		const result = await checkInComponent(componentName, binLocation);
		const message = result?.message || "Checked in.";
		_speak(message);
		_log(result);

		// Keep the internal component list up to date for fuzzy matching.
		const list = await getListOfComponents();
		setComponentList(list);
	} catch (err) {
		_log(err);
		_speak(err.message || "Failed to check in the component.");
	}
}

async function _handleCheckOut({ componentName }) {
	if (!componentName) {
		_speak("To check out, please say something like: check out resistor.");
		return;
	}

	// Ensure we have the latest inventory for matching.
	try {
		const list = await getListOfComponents();
		setComponentList(list);
	} catch (err) {
		_log("Failed to refresh inventory for fuzzy matching", err);
	}

	if (!verifyComponentName(componentName)) {
		const suggestion = findFuzzyComponent(componentName);
		if (suggestion) {
			_speak(
				`I couldn't find "${componentName}". Did you mean "${suggestion.componentName}" in bin ${suggestion.binLocation}?`,
			);
		} else {
			_speak(`I couldn't find "${componentName}" in the inventory.`);
		}
		return;
	}

	try {
		const result = await checkOutComponent(componentName);
		const message = result?.message || "Checked out.";
		_speak(message);
		_log(result);

		const list = await getListOfComponents();
		setComponentList(list);
	} catch (err) {
		_log(err);
		_speak(err.message || "Failed to check out the component.");
	}
}

async function _handleFind({ componentName }) {
	if (!componentName) {
		_speak("To find a component, please say something like: find resistor.");
		return;
	}

	try {
		const list = await getListOfComponents();
		setComponentList(list);

		const exact = findComponentBin(componentName);
		if (exact) {
			const message = `The ${componentName} is in bin ${exact}.`;
			_speak(message);
			_log(message);
			return;
		}

		const fuzzy = findFuzzyComponent(componentName);
		if (fuzzy) {
			const message = `I couldn't find ${componentName}, but I found ${fuzzy.componentName} in bin ${fuzzy.binLocation}.`;
			_speak(message);
			_log(message);
			return;
		}

		_speak(`I couldn't find ${componentName} in the inventory.`);
	} catch (err) {
		_log(err);
		_speak(err.message || "Failed to locate the component.");
	}
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

function _init() {
	if (!button) {
		_log("No #listen button found.");
		return;
	}

	_ensureRecognition();

	button.onclick = () => {
		if (!recognition) return;
		button.disabled = true;
		_setOutput("Listening...");
		recognition.start();
	};
}

_init();
