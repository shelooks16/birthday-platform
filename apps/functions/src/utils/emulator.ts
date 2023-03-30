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
