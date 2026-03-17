# Overview

This document describes the backend logic for connecting to the Google Sheets database using Google Apps Script. The backend will handle the storage and retrieval of component information based on the commands received from the frontend.

## Provided Endpoints

The backend will provide the following endpoints for the frontend to interact with:

1. `checkInComponent(componentName, binLocation)` - This endpoint will check in a component by adding its name and bin location to the Google Sheets database.
2. `checkOutComponent(componentName)` - This endpoint will check out a component by removing its entry from the Google Sheets database.
3. `getListOfComponents()` - This endpoint will return a list of all components currently checked in, along with their bin locations. This is used by find command to locate components. It will be called when the app is initialized to load the current state of the inventory. These will also be used to verify part names before checking in or out to ensure that the component exists in the database.

## Public functions

The backend will expose the following public functions that can be called from the frontend:

- `checkInComponent(componentName, binLocation)`: This function will take the component name and bin location as parameters, and will add a new entry to the Google Sheets database with this information. It will return a success message if the operation is successful, or an error message if there is an issue (e.g., if the component name is already checked in).
- `checkOutComponent(componentName)`: This function will take the component name as a parameter, and will remove the corresponding entry from the Google Sheets database. It will return a success message if the operation is successful, or an error message if there is an issue (e.g., if the component name is not found in the database).
- `getListOfComponents()`: This function will return a list of all components currently checked in, along with their bin locations. This will be used by the frontend to display the current inventory and to verify component names before checking in or out.
