import {
  BirthdayDocument,
  NotificationChannelDocument,
  NotificationDocument
} from '@shared/types';
import { createResource, Accessor, createMemo } from 'solid-js';
import { useBirthdaysCtx } from '../birthday/birthdays.context';
import { useNotificationChannelsCtx } from '../notificationChannel/notificationChannels.context';
import { useUserCtx } from '../user/user.context';
import { notificationDataService } from './notification.service';

export type NotificationsFilter = {
  orderByNotifyAt?: 'asc' | 'desc';
};

export type NotificationDocumentWithRelations = NotificationDocument & {
  _sourceBirthday: BirthdayDocument | null;
  _notificationChannel: NotificationChannelDocument | null;
};

export const useNotificationList = (filter?: Accessor<NotificationsFilter>) => {
  const [userCtx] = useUserCtx();
  const [birthdays] = useBirthdaysCtx();
  const [channels] = useNotificationChannelsCtx();

  const [resource, actions] = createResource(
    () => {
      if (!userCtx.user?.uid) return null;

      return {
        profileId: userCtx.user!.uid,
        filter: filter?.()
      };
    },
    ({ profileId, filter = {} }) =>
      notificationDataService.db().then((db) => {
        return db.findMany({
          where: [['profileId', '==', profileId]],
          orderBy: {
            notifyAt: filter.orderByNotifyAt ?? 'asc'
          }
        });
      })
  );

  const notificationListWithRelations = createMemo<
    NotificationDocumentWithRelations[] | undefined
  >(() => {
    if (!resource.error && resource.latest) {
      return resource.latest.map<NotificationDocumentWithRelations>(
        (notification) => {
          const _sourceBirthday =
            !birthdays.error && birthdays.latest?.length
              ? birthdays.latest.find(
                  (b) => b.id === notification.sourceBirthdayId
                ) ?? null
              : null;
          const _notificationChannel =
            !channels.error && channels.latest?.length
              ? channels.latest.find(
                  (ch) => ch.id === notification.notificationChannelId
                ) ?? null
              : null;

          return {
            ...notification,
            _sourceBirthday,
            _notificationChannel
          };
        }
      );
    }

    return undefined;
  });

  return [notificationListWithRelations, resource, actions] as const;
};
