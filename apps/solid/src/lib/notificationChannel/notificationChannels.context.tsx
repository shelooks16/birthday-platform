import { NotificationChannelDocument } from '@shared/types';
import {
  createContext,
  createResource,
  ParentComponent,
  ResourceReturn,
  useContext
} from 'solid-js';
import { previewData } from '../previewMode/fakeData';
import { usePreviewModeCtx } from '../previewMode/preview-mode.context';
import { useUserCtx } from '../user/user.context';
import { notificationChannelService } from './notificationChannel.service';

const NotificationChannelsContext =
  createContext<ResourceReturn<NotificationChannelDocument[], unknown>>();
export const useNotificationChannelsCtx = () =>
  useContext(NotificationChannelsContext)!;

export const NotificationChannelsProvider: ParentComponent = (props) => {
  const [isPreviewMode] = usePreviewModeCtx();
  const [userCtx] = useUserCtx();
  const resourceReturn = createResource(
    () => userCtx.user?.uid,
    (profileId) =>
      isPreviewMode()
        ? previewData.notificationChannels()
        : notificationChannelService.findForProfile(profileId)
  );

  return (
    <NotificationChannelsContext.Provider value={resourceReturn}>
      {props.children}
    </NotificationChannelsContext.Provider>
  );
};
