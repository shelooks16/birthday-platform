import * as functions from "firebase-functions";
import { createDebugHttpFn } from "./utils";

async function notifyUsersIfNeeded() {
  functions.logger.info("hello from notifdy");
}

export const checkNotifications = functions
  .region("europe-west1")
  .pubsub.schedule("every 15 seconds")
  .onRun(async () => {
    await notifyUsersIfNeeded();
  });

export const debugCheckNotifications = createDebugHttpFn(async () => {
  await notifyUsersIfNeeded();
});
