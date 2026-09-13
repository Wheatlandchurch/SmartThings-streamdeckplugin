# SmartThings Stream Deck Plugin

A Stream Deck plugin for launching Samsung SmartThings automations directly from a button press. The plugin authenticates to the SmartThings API, loads your available automations, and lets you map a selected automation to a Stream Deck action.

## Current status

This project is in active development and currently supports:

- SmartThings OAuth authorization flow
- token exchange and refresh-token handling
- saving and restoring access credentials in the Stream Deck action settings
- loading available automations from a SmartThings location
- testing the SmartThings connection from the property inspector
- triggering a selected automation from a Stream Deck key press
- a property inspector UI for credential setup and automation selection

The plugin builds successfully with the current project configuration and generates the packaged Stream Deck plugin bundle under the plugin folder.

## Features

- Run one SmartThings automation per button
- Store SmartThings client credentials and tokens in the action configuration
- Open the SmartThings authorization page from the inspector
- Refresh expired access tokens automatically from the plugin UI
- Load available automation names and IDs from your SmartThings account
- Set a custom button label such as "Goodnight" or "Movie Time"
- Trigger automation execution directly from Stream Deck

## Requirements

- Elgato Stream Deck software installed
- Node.js 20+
- npm
- A SmartThings developer app with a client ID and client secret
- Permission to access the SmartThings location and automations you want to trigger

## SmartThings app setup

Before the plugin can work, create or update a SmartThings developer app and configure the OAuth redirect URI.

1. Open the SmartThings Developer Portal:
   - https://developer.smartthings.com/
2. Sign in to the SmartThings Developer Workspace.
3. Create or open a SmartThings app.
4. Copy the Client ID and Client Secret.
5. Set the redirect URI to the same value used in the plugin inspector, typically:
   - https://localhost
6. Make sure the app has the permissions needed to access the automations and locations you want to control.

The property inspector also includes a direct link to the Developer Portal during initial setup.

## Build and package

From the project root:

```bash
npm install
npm run build
```

This generates the plugin bundle in:

- com.wheatland-community-church.smartthings.sdPlugin/bin/plugin.js

The folder com.wheatland-community-church.smartthings.sdPlugin is the Stream Deck plugin package payload. The packaged installable plugin is created as:

- com.wheatland-community-church.smartthings.sdPlugin/com.wheatland-community-church.smartthings.streamDeckPlugin

## Using the plugin in Stream Deck

### 1. Load the plugin

Use the Stream Deck plugin packaging flow for your platform to install the generated plugin. Once installed, the plugin action will appear as a SmartThings automation button.

### 2. Configure the action

Click the new SmartThings action in Stream Deck to open the property inspector.

The inspector includes the following sections:

- SmartThings app setup
  - Developer portal link
  - Client ID
  - Client Secret
  - Redirect URI
  - Authorize button
- Access & location
  - Access token
  - Refresh token
  - Location ID
  - Saved credential status badges
  - Refresh Token and Test Connection buttons
- Automation selection
  - Load Automations button
  - Automation dropdown
  - Button label field
  - status summary

### 3. Authorize with SmartThings

1. Open the SmartThings Developer Portal link in the inspector or visit https://developer.smartthings.com/ directly.
2. Enter your SmartThings Client ID and Client Secret.
3. Click Authorize.
4. A browser window opens to the SmartThings OAuth page.
5. Sign in and approve access.
6. Return to the Stream Deck configuration window.
7. The inspector processes the OAuth callback and stores the returned token.

### 4. Load automations

1. Make sure the access token is present.
2. Optionally fill in a Location ID if you want to scope requests more explicitly.
3. Click Load Automations.
4. Choose the automation you want the button to trigger.
5. Set the button label to something easily recognizable.

### 5. Test the connection

Use the Test Connection button to confirm SmartThings is reachable and the credentials are valid before assigning the automation to a key.

### 6. Trigger an automation

After the action is configured:

- press the Stream Deck key
- the plugin sends the selected automation ID to SmartThings
- the automation runs immediately
- the button can show the success state and title assigned in the action settings

## Interaction flow

The plugin flow is:

1. User enters SmartThings app credentials in the inspector.
2. User authorizes the app and exchanges the OAuth code for tokens.
3. Tokens are saved in the plugin settings and local token storage.
4. User loads automations from SmartThings.
5. User selects one automation and gives the button a label.
6. Pressing the button executes the selected automation.

## Project structure

```text
SmartThings-streamdeckplugin/
├── README.md
├── package.json
├── tsconfig.json
├── rollup.config.mjs
├── src/
│   ├── plugin.ts
│   ├── auth.ts
│   ├── smartthings-client.ts
│   ├── token-manager.ts
│   └── actions/
│       └── automation.ts
├── com.wheatland-community-church.smartthings.sdPlugin/
│   ├── manifest.json
│   ├── ui/
│   ├── imgs/
│   └── bin/
└── LICENSE
```

## Notes and limitations

- The plugin stores token data in the action settings and persistence layer used by the Stream Deck runtime.
- Real automation execution depends on a valid SmartThings app configuration and the permissions granted to that app.
- If a token expires, use the Refresh Token button or complete the OAuth flow again.
- This plugin is intended for personal or organization use with a valid SmartThings developer app and compatible Stream Deck installation.

## License

This project is licensed under the MIT License.
