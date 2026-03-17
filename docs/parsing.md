# Overview

This file explains how the user commands will be parsed and processed to determine the appropriate action to take. The parsing logic will be implemented in the `parse.js` file, which will contain functions to analyze the user's voice input and extract the relevant information for each command.

## Command Structure

The three commands that the assistant will recognize are structured as follows:

1. "Check in [component name] [bin]"
2. "Check out [component name] [bin]"
3. "find [component name]"

## Alternate Words

To make the assistant more flexible and user-friendly, we will also allow for some alternate words that can be used in place of the main command keywords. For example:

- "Check in" can also be recognized as "Add", "Store", or "Register".
- "Check out" can also be recognized as "Remove", "Take out", or "Unregister".
- "find" can also be recognized as "locate", "where is", or "search for".

## Parsing Logic

The parsing logic will involve the following steps:

1. Convert the user's voice input into a string and normalize it (e.g., convert to lowercase).
2. Use regular expressions or string matching to identify which command is being issued based on the presence of the main keywords or their alternates.
3. Extract the component name and bin location (if applicable) from the command.
4. Return an object containing the command type, component name, and bin location (if applicable) for further processing by the main logic in `main.js`.

## Notes

- The parsing logic should be able to ask the user for clarification if the command is not clear or if required information is missing (e.g., if the component name or bin location is not provided).
