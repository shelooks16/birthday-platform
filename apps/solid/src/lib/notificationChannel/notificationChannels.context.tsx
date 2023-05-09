import { NotificationChannelDocument } from '@shared/types';
import {
  createContext,
  createResource,
  ParentComponent,
  ResourceReturn,
  useContext
} from 'solid-js';
import { useUserCtx } from '../user/user.context';
import { notificationChannelService } from './notificationChannel.service';

const NotificationChannelsContext =
  createContext<ResourceReturn<NotificationChannelDocument[], unknown>>();
export const useNotificationChannelsCtx = () =>
  useContext(NotificationChannelsContext)!;

export const NotificationChannelsProvider: ParentComponent = (props) => {
  const [userCtx] = useUserCtx();
  const resourceReturn = createResource(
    () => userCtx.user?.uid,
    notificationChannelService.getChannelsByProfileId
  );

  return (
    <NotificationChannelsContext.Provider value={resourceReturn}>
      {props.children}
    </NotificationChannelsContext.Provider>
  );
};
