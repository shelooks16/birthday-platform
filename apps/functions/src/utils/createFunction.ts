import * as fnHttps from 'firebase-functions/v2/https';
import * as fnFirestore from 'firebase-functions/v2/firestore';
import * as fnScheduler from 'firebase-functions/v2/scheduler';
import * as functionsV1 from 'firebase-functions/v1';
import { HttpsErrorInternal } from './errors';
import { logger } from './logger';
import { appConfig } from '../appConfig';

const REGION = 'europe-west1';

type ChangeType = 'create' | 'update' | 'delete';

const getChangeType = (
  writeEvent: fnFirestore.FirestoreEvent<
    fnFirestore.Change<fnFirestore.DocumentSnapshot> | undefined
  >
): ChangeType => {
  if (!writeEvent.data?.after?.exists) {
    return 'delete';
  }
  if (!writeEvent.data?.before?.exists) {
    return 'create';
  }
  return 'update';
};

const logUnhandledType = (changeType: ChangeType) => {
  logger.warn('Unhandled function change type', { changeType });
};

export type OnCreateHandler = (
  createEvent: fnFirestore.FirestoreEvent<
    fnFirestore.Change<fnFirestore.DocumentSnapshot> | undefined
  >
) => any;
export type OnUpdateHandler = (
  updateEvent: fnFirestore.FirestoreEvent<
    fnFirestore.Change<fnFirestore.DocumentSnapshot>
  >
) => any;
export type OnDeleteHandler = (
  deleteEvent: fnFirestore.FirestoreEvent<
    fnFirestore.Change<fnFirestore.DocumentSnapshot> | undefined
  >
) => any;

type handleOnWriteOptions = {
  onCreate?: OnCreateHandler;
  onUpdate?: OnUpdateHandler;
  onDelete?: OnDeleteHandler;
};

export const createOnWriteFunction = (
  documentPath: string,
  handlers: handleOnWriteOptions,
  options?: Omit<fnFirestore.DocumentOptions<string>, 'region' | 'document'>
) => {
  return fnFirestore.onDocumentWritten(
    {
      ...options,
      region: REGION,
      document: documentPath
    },
    async (writeEvent) => {
      const {
        onCreate = () => logUnhandledType('create'),
        onUpdate = () => logUnhandledType('update'),
        onDelete = () => logUnhandledType('delete')
      } = handlers;

      const changeType = getChangeType(writeEvent);

      logger.info('Document write', {
        changeType,
        docId: writeEvent.data?.after?.id ?? writeEvent.data?.before.id,
        documentPath
      });

      switch (changeType) {
        case 'create':
          await onCreate(writeEvent);
          break;
        case 'delete':
          await onDelete(writeEvent);
          break;
        case 'update':
          await onUpdate(writeEvent as any);
          break;
        default: {
          logger.warn('Invalid change type', { changeType });
        }
      }
    }
  );
};

export const createOnCreateFunction = (
  documentPath: string,
  handler: (
    changeEvent: fnFirestore.FirestoreEvent<fnFirestore.QueryDocumentSnapshot>
  ) => any,
  options?: Omit<fnFirestore.DocumentOptions<string>, 'region' | 'document'>
) => {
  return fnFirestore.onDocumentCreated(
    {
      ...options,
      region: REGION,
      document: documentPath
    },
    async (createEvent) => {
      logger.info('Document created', {
        docId: createEvent.data?.id,
        documentPath
      });

      await handler(createEvent as any);
    }
  );
};

export const createOnUpdateFunction = (
  documentPath: string,
  handler: (
    changeEvent: fnFirestore.FirestoreEvent<
      fnFirestore.Change<fnFirestore.QueryDocumentSnapshot>
    >
  ) => any,
  options?: Omit<fnFirestore.DocumentOptions<string>, 'region' | 'document'>
) => {
  return fnFirestore.onDocumentUpdated(
    {
      ...options,
      region: REGION,
      document: documentPath
    },
    async (changeEvent) => {
      logger.info('Document updated', {
        docId: changeEvent.data?.after?.id,
        documentPath
      });

      await handler(changeEvent as any);
    }
  );
};

export const createOnDeleteFunction = (
  documentPath: string,
  handler: (
    deleteEvent: fnFirestore.FirestoreEvent<fnFirestore.QueryDocumentSnapshot>
  ) => any,
  options?: Omit<fnFirestore.DocumentOptions<string>, 'region' | 'document'>
) => {
  return fnFirestore.onDocumentDeleted(
    {
      ...options,
      region: REGION,
      document: documentPath
    },
    async (deleteEvent) => {
      logger.info('Document deleted', {
        docId: deleteEvent.data?.id,
        documentPath
      });

      await handler(deleteEvent as any);
    }
  );
};

/** Timezone is always UTC */
export const createScheduledFunction = (
  schedule: string,
  handler: (event: fnScheduler.ScheduledEvent) => any,
  options?: Omit<fnHttps.HttpsOptions, 'region' | 'schedule'>
) => {
  return fnScheduler.onSchedule(
    { ...options, schedule, region: REGION, timeZone: 'UTC' },
    handler
  );
};

export const createDebugHttpFn = (
  cb?: (req: fnHttps.Request, res: functionsV1.Response) => any,
  options?: Omit<fnHttps.HttpsOptions, 'region'>
) => {
  return appConfig.isDevEnv
    ? fnHttps.onRequest({ ...options, region: REGION }, async (req, res) => {
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
  handler: (
    user: functionsV1.auth.UserRecord,
    context: functionsV1.EventContext
  ) => any
) => {
  return functionsV1
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

export const createCallableFunction = <TData = any>(
  handler: (req: fnHttps.CallableRequest<TData>) => any,
  options?: Omit<fnHttps.CallableOptions, 'region'>
) => {
  return fnHttps.onCall({ ...options, region: REGION }, async (req) => {
    try {
      const responseBody = await handler(req);

      return responseBody;
    } catch (err) {
      throw new HttpsErrorInternal(err.message);
    }
  });
};

export const createOnRequestFunction = (
  handler: (
    req: fnHttps.Request,
    res: functionsV1.Response
  ) => void | Promise<void>,
  options?: Omit<fnHttps.HttpsOptions, 'region'>
) => {
  return fnHttps.onRequest({ ...options, region: REGION }, async (req, res) => {
    try {
      const responseBody = await handler(req, res);

      return responseBody;
    } catch (err) {
      throw new HttpsErrorInternal(err.message);
    }
  });
};
