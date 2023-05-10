import { Box, Heading } from '@hope-ui/solid';
import { parseNotifyBeforePreset } from '@shared/notification';
import { BirthdayNotificationSettings } from '@shared/types';
import { Component } from 'solid-js';
import { useI18n } from '../../i18n.context';

type EnabledNotificationsPreviewProps = {
  notificationSettings: BirthdayNotificationSettings;
  inTooltip?: boolean;
};

const EnabledNotificationsPreview: Component<
  EnabledNotificationsPreviewProps
> = (props) => {
  const [i18n] = useI18n();

  const getPresetTestList = () => {
    return props.notificationSettings.notifyAtBefore
      .map((preset) => {
        const { value: unitValue, humanUnit } = parseNotifyBeforePreset(preset);

        return i18n().t('notification.notifyBeforePresetLabel', {
          value: i18n().format.toPlainTime(unitValue, humanUnit)
        });
      })
      .join(', ');
  };

  return (
    <Box>
      <Heading as="h6" fontWeight={props.inTooltip ? '$normal' : undefined}>
        Notifications enabled (
        {props.notificationSettings.notifyAtBefore.length})
      </Heading>
      <Box mt={props.inTooltip ? '$2' : '0'} textTransform="lowercase">
        {getPresetTestList()}
      </Box>
    </Box>
  );
};

export default EnabledNotificationsPreview;
