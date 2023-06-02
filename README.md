# Buddy Birthday

<p align="center"><img src="apps/solid/public/icon.svg" height="70"></p>

> Workspace for Buddy Birthday platform.
> Monorepo is powered by [Turborepo](https://turbo.build/)

## Local development

### Requirements:

- Node.js ^16.15.0
- [Firebase project setup](https://console.firebase.google.com/) - web app, auth google login, firestore, functions
- [Telegram bot token](https://core.telegram.org/bots/tutorial#obtain-your-bot-token)
- (Optional) [OpenAI API key](https://platform.openai.com/account/api-keys) - birthday wish generation
- (Optional) [Sentry.io account](https://sentry.io/) - unexpected errors catching

### First time setup after cloning

1. Create `.firebaserc` in root folder next to `.firebaserc.example`. Fill all fields with Firebase project ids. If you have created only one project - fill all fields with the same project id.
2. Install Firebase CLI: `npm install -g firebase-tools@^12.2.1`
3. Run to init Firebase CLI: `firebase login` then `firebase use dev`
4. From root folder install dependencies: `npm install`
5. Setup local env files: `npm run setup-env`
6. Fill in created:
   - `apps/solid/.env`
   - `apps/functions/env/service-account.json` - download firebase-adminsdk from Google Cloud Console
   - `apps/functions/env/.secret.local`

### Develop locally

Run in two separate terminal instances:

```
npm run dev
npm run emulators
```

- `localhost:3000` - Solid.js web app
- `localhost:4000` - Firebase local emulator suite

## Deployment

All supported environments can be categorized as:

- `dev` - local development
- `stage` - live stage
- `prod` - live production

Deployment takes place through Github Actions `deploy` workflow.

### Environment and secrets

Required Github action secrets:

- `FIREBASE_CI_TOKEN` - obtained from running `firebase login:ci`

Required Github action variables:

- `FIREBASE_PROJECT_ID_PROD` - production firebase project id
- `FIREBASE_PROJECT_ID_STAGE` - staging firebase project id
- `WEB_ENV_FILE_PROD` - production `.env` file for web app. See `apps/solid/.env.example`
- `WEB_ENV_FILE_STAGE` - staging `.env` file for web app. See `apps/solid/.env.example`

GCP Secret Manager must have secrets with the same name as written in `apps/functions/env/.secret.local.example`. During local development functions use that file, when deployed - functions use values from Secret Manager.

### Post deployment

After functions are deployed, set `telegramBot` function URL as telegram bot webhook. To get an idea see `initTelegramBotWebhook.mjs`. This needs to be done only once.

## Future considerations

- Discord bot integration
- Move firebase functions to 2nd gen

## Contribution

Main development branch is `main`.

Workflow:

1. Checkout to `main` branch
2. Create feature branch `git checkout -b some-branch-name`
3. Push feature branch: `git push origin some-branch-name`
4. Open a new PR to merge `some-branch-name` into `main`
5. Wait for review and collaborate

## Contact

- Andrew - blauyedz@zoho.eu, @shelooks16
