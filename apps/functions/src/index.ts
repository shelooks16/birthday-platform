import * as functions from "firebase-functions";
import { name } from "ui";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });

  response.send(`Hello, ${name} from Firebase!`);
});
