# Overview

This file explains what the component.js script will do. it is extected to take the string of components from backend.js and create a list of components that can be used by the frontend to display the current inventory and to verify component names before checking in or out. It will also handle the creation of the component objects that will be used throughout the application.

## Public Functions

- `findFuzzyComponment(fuzzyName)`: This function will take a fuzzy component name as input and will return the best matching component from the list of components. It will use a string similarity algorithm to compare the fuzzy name with the names of the components in the inventory and will return the component with the highest similarity score.
- `verifyComponentName(componentName)`: This function will take a component name as input and will check if it exists in the list of components. It will return true if the component exists, and false if it does not.
- `findComponentBin(componentName)`: This function will take a component name as input and will return the bin location of the component if it is checked in, or null if it is not in the inventory.
