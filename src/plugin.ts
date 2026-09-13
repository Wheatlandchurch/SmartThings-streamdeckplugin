import streamDeck from "@elgato/streamdeck";

import { AutomationAction } from "./actions/automation";
import { ConnectionManager, ErrorHandler } from "./utils";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new AutomationAction());

process.on("SIGINT", async () => {
  ErrorHandler.logInfo("Plugin", "Shutting down SmartThings Stream Deck Plugin");
  await ConnectionManager.cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  ErrorHandler.logInfo("Plugin", "Terminating SmartThings Stream Deck Plugin");
  await ConnectionManager.cleanup();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  ErrorHandler.logError("Plugin", error);
  ConnectionManager.cleanup().finally(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  ErrorHandler.logError("Plugin", `Unhandled rejection: ${String(reason)}`);
});

ErrorHandler.logInfo("Plugin", "Starting SmartThings Stream Deck Plugin");
streamDeck.connect();
