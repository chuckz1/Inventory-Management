/*
  main.js

  Handles UI wiring for manual entry and inventory display.
*/

import {
	checkInComponent,
	checkOutComponent,
	getListOfComponents,
} from "./backend.js";
import {
	setComponentList,
	verifyComponentName,
	findFuzzyComponent,
} from "./component.js";

const statusEl = document.getElementById("status");
const inventoryPlaceholder = document.getElementById("inventoryPlaceholder");
const inventoryTable = document.getElementById("inventoryTable");
const inventoryTbody = inventoryTable?.querySelector("tbody");

const checkInForm = document.getElementById("checkInForm");
const checkOutForm = document.getElementById("checkOutForm");
const refreshButton = document.getElementById("refresh");

function setStatus(message, isError = false) {
	if (!statusEl) return;
	statusEl.textContent = message;
	statusEl.style.color = isError ? "#ff6b6b" : "var(--muted)";
}

function setLoading(isLoading) {
	const text = isLoading ? "Loading…" : "Ready.";
	setStatus(text, false);
}

function renderInventory(list) {
	if (!inventoryTable || !inventoryTbody || !inventoryPlaceholder) return;

	if (!Array.isArray(list) || list.length === 0) {
		inventoryTable.classList.add("hidden");
		inventoryPlaceholder.classList.remove("hidden");
		return;
	}

	inventoryTable.classList.remove("hidden");
	inventoryPlaceholder.classList.add("hidden");

	inventoryTbody.innerHTML = "";

	list.forEach((item) => {
		const row = document.createElement("tr");

		const nameCell = document.createElement("td");
		nameCell.textContent = item.componentName || "(unknown)";
		row.appendChild(nameCell);

		const binCell = document.createElement("td");
		binCell.textContent = item.binLocation || "(none)";
		row.appendChild(binCell);

		inventoryTbody.appendChild(row);
	});
}

async function refreshInventory() {
	setLoading(true);
	try {
		const list = await getListOfComponents();
		setComponentList(list);
		renderInventory(list);
		setStatus("Inventory updated.");
	} catch (err) {
		console.error(err);
		setStatus(err?.message || "Failed to load inventory.", true);
	}
}

function clearForm(form) {
	form.querySelectorAll("input").forEach((input) => (input.value = ""));
}

async function handleCheckIn(event) {
	event.preventDefault();
	if (!checkInForm) return;

	const component = checkInForm.elements["component"]?.value.trim();
	const bin = checkInForm.elements["bin"]?.value.trim();

	if (!component || !bin) {
		setStatus("Please enter a component and a bin.", true);
		return;
	}

	if (verifyComponentName(component)) {
		setStatus(
			"That component is already checked in. Use Check Out first or choose a different name.",
			true,
		);
		return;
	}

	setStatus("Checking in…");

	try {
		const result = await checkInComponent(component, bin);
		setStatus(result?.message || "Checked in.");
		clearForm(checkInForm);
		await refreshInventory();
	} catch (err) {
		console.error(err);
		setStatus(err?.message || "Failed to check in.", true);
	}
}

async function handleCheckOut(event) {
	event.preventDefault();
	if (!checkOutForm) return;

	const component = checkOutForm.elements["component"]?.value.trim();
	if (!component) {
		setStatus("Please enter a component.", true);
		return;
	}

	if (!verifyComponentName(component)) {
		const suggestion = findFuzzyComponent(component);
		if (suggestion) {
			setStatus(
				`Component not found. Did you mean "${suggestion.componentName}" (bin ${suggestion.binLocation})?`,
				true,
			);
		} else {
			setStatus("Component not found in inventory.", true);
		}
		return;
	}

	setStatus("Checking out…");

	try {
		const result = await checkOutComponent(component);
		setStatus(result?.message || "Checked out.");
		clearForm(checkOutForm);
		await refreshInventory();
	} catch (err) {
		console.error(err);
		setStatus(err?.message || "Failed to check out.", true);
	}
}

function init() {
	if (checkInForm) {
		checkInForm.addEventListener("submit", handleCheckIn);
	}

	if (checkOutForm) {
		checkOutForm.addEventListener("submit", handleCheckOut);
	}

	if (refreshButton) {
		refreshButton.addEventListener("click", refreshInventory);
	}

	refreshInventory();
}

init();
