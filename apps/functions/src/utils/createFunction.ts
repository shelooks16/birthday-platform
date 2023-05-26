import * as functions from 'firebase-functions';
import type { UserRecord } from 'firebase-admin/auth';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from './logger';
import { appConfig } from '../appConfig';

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
  logger.warn('Unhandled function change type', { changeType });
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

      logger.info('Document write', {
        changeType,
        docId: change.after?.id ?? change.before.id,
        documentPath
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

export const createOnCreateFunction = (
  documentPath: string,
  handler: (snapshot: DocumentSnapshot, context: functions.EventContext) => any
) => {
  return functions
    .region(REGION)
    .firestore.document(documentPath)
    .onCreate(async (snapshot, ctx) => {
      logger.info('Document created', {
        docId: snapshot.id,
        documentPath
      });

      await handler(snapshot, ctx);
    });
};

export const createOnUpdateFunction = (
  documentPath: string,
  handler: (
    change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
    context: functions.EventContext
  ) => any
) => {
  return functions
    .region(REGION)
    .firestore.document(documentPath)
    .onUpdate(async (change, ctx) => {
      logger.info('Document updated', {
        docId: change.after.id,
        documentPath
      });

      await handler(change, ctx);
    });
};

export const createOnDeleteFunction = (
  documentPath: string,
  handler: (
    snapshot: functions.firestore.QueryDocumentSnapshot,
    context: functions.EventContext
  ) => any
) => {
  return functions
    .region(REGION)
    .firestore.document(documentPath)
    .onDelete(async (snapshot, ctx) => {
      logger.info('Document deleted', {
        docId: snapshot.id,
        documentPath
      });

      await handler(snapshot, ctx);
    });
};

/** Timezone is always UTC */
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
  return appConfig.isDevEnv
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

export const createAuthFunction = (
  triggerType: 'onDelete' | 'onCreate',
  handler: (user: UserRecord, context: functions.EventContext) => any
) => {
  return functions
    .region(REGION)
    .auth.user()
    [triggerType](async (user, ctx) => {
      logger.info(
        triggerType === 'onCreate' ? 'User created' : 'User deleted',
        {
          userId: user.uid
        }
      );

      await handler(user, ctx);
    });
};

export const createCallableFunction = (
  handler: (data: any, context: functions.https.CallableContext) => any
) => {
  return functions.region(REGION).https.onCall(async (data, ctx) => {
    try {
      const responseBody = await handler(data, ctx);

      return responseBody;
    } catch (err) {
      throw new functions.https.HttpsError('internal', err.message);
    }
  });
};

export const createOnRequestFunction = (
  handler: (
    req: functions.https.Request,
    res: functions.Response<any>
  ) => void | Promise<void>
) => {
  return functions.region(REGION).https.onRequest(async (req, res) => {
    try {
      const responseBody = await handler(req, res);

      return responseBody;
    } catch (err) {
      throw new functions.https.HttpsError('internal', err.message);
    }
  });
};
