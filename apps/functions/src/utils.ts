import * as functions from "firebase-functions";
import path from "node:path";

export const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

export function initServiceAccount() {
  if (isEmulator) {
    process.env["GOOGLE_APPLICATION_CREDENTIALS"] = path.join(
      __dirname,
      "../../../service-account.dev.json"
    );
  }
}

export function createDebugHttpFn(
  cb?: (req: functions.https.Request, res: functions.Response<any>) => any
) {
  return isEmulator
    ? functions.region("europe-west1").https.onRequest(async (req, res) => {
        let body: any = { status: "ok" };

        try {
          if (cb) {
            body = (await cb(req, res)) || body;
          }
        } catch (err) {
          body = { error: err.message };
        }

        res.json(body);
      })
    : null;
}
