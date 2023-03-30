import * as functions from 'firebase-functions';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { isEmulator } from './emulator';

const REGION = 'europe-west1';

type ChangeType = 'create' | 'update' | 'delete';

const getChangeType = (
  change: functions.Change<DocumentSnapshot>
): ChangeType => {
  if (!change.after.exists) {
    return 'delete';
  }
  if (!change.before.exists) {
    return 'create';
  }
  return 'update';
};

const logUnhandledType = (changeType: ChangeType) => {
  functions.logger.warn('Unhandled function change type', { changeType });
};

export type OnCreateHandler = (
  docSnap: DocumentSnapshot,
  ctx: functions.EventContext
) => any;
export type OnUpdateHandler = (
  docSnapBeforeUpdate: DocumentSnapshot,
  docSnapAfterUpdate: DocumentSnapshot,
  ctx: functions.EventContext
) => any;
export type OnDeleteHandler = (
  docSnapBeforeDeleted: DocumentSnapshot,
  ctx: functions.EventContext
) => any;

type handleOnWriteOptions = {
  onCreate?: OnCreateHandler;
  onUpdate?: OnUpdateHandler;
  onDelete?: OnDeleteHandler;
};

export const createOnWriteFunction = (
  documentPath: string,
  handlers: handleOnWriteOptions
) => {
  return functions
    .region(REGION)
    .firestore.document(documentPath)
    .onWrite(async (change, ctx) => {
      const {
        onCreate = () => logUnhandledType('create'),
        onUpdate = () => logUnhandledType('update'),
        onDelete = () => logUnhandledType('delete')
      } = handlers;

      const changeType = getChangeType(change);

      functions.logger.info(`Processing document ${documentPath}`, {
        changeType,
        docId: change.after?.id ?? change.before.id
      });

      switch (changeType) {
        case 'create':
          await onCreate(change.after, ctx);
          break;
        case 'delete':
          await onDelete(change.before, ctx);
          break;
        case 'update':
          await onUpdate(change.before, change.after, ctx);
          break;
        default: {
          throw new Error(`Invalid change type: ${changeType}`);
        }
      }
    });
};

export const createScheduledFunction = (
  schedule: string,
  handler: (context: functions.EventContext) => any
) => {
  return functions
    .region(REGION)
    .pubsub.schedule(schedule)
    .timeZone('UTC')
    .onRun(handler);
};

export const createDebugHttpFn = (
  cb?: (req: functions.https.Request, res: functions.Response<any>) => any
) => {
  return isEmulator
    ? functions.region(REGION).https.onRequest(async (req, res) => {
        let body: any = { status: 'ok' };

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
};
