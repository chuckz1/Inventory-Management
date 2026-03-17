# Overview

The goal of this project is a voice assistant to help with check in / check out of components in my electronics workshop. The assistant will have three commands:

- "Check in [component name] [bin]" - This command will check in a component and store its name and bin location in a database.
- "Check out [component name] [bin]" - This command will check out a component and remove it
  from the database.
- "find [component name]" - This command will return the bin location of the component if it is checked in, or a message saying it is not checked in if it is not in the database.

The assistant will be a web application hosted by github pages, and will use app scripts tied with my google spreadsheet as the backend to store the component information. This part of the project is just the frontend. The assistant will use the Web Speech API for voice recognition and speech synthesis.

## Implementation Plan

1. Set up the web application structure with HTML, CSS, and JavaScript files.
2. Implement the voice recognition functionality using the Web Speech API to capture user commands.
3. Implement the speech synthesis functionality using the Web Speech API to provide feedback to the user.
4. Create functions to handle the three commands (check in, check out, find) and communicate with the backend using fetch API to send requests to the app scripts.

## 📁 Project File Structure (Tree)

```
Inventory Management/UserInterface
├── index.html
├── style.css
├── docs
│   └── planning.md
└── scripts
    ├── main.js - main logic that ties everything together
    ├── backend.js - handles communication with the backend
    ├── parse.js - parses user commands
    └── voice.js - handles voice recognition and speech synthesis
```
