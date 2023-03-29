import "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { initServiceAccount } from "./utils";

initServiceAccount();
initializeApp();

export {
  checkNotifications,
  debugCheckNotifications,
} from "./checkNotifications";
