import { Box, Heading } from '@hope-ui/solid';
import { parseNotifyBeforePreset } from '@shared/notification';
import {
  BirthdayNotificationSettings,
  NotifyBeforePreset
} from '@shared/types';
import { Component, For } from 'solid-js';
import { useI18n } from '../../i18n.context';

type EnabledNotificationsPreviewProps = {
  notificationSettings: BirthdayNotificationSettings;
  eachItemOnNewLine?: boolean;
  inTooltip?: boolean;
};

const EnabledNotificationsPreview: Component<
  EnabledNotificationsPreviewProps
> = (props) => {
  const [i18n] = useI18n();

  const getPresetLabel = (preset: NotifyBeforePreset) => {
    const { value: unitValue, humanUnit } = parseNotifyBeforePreset(preset);

    return i18n().t('notification.notifyBeforePresetLabel', {
      value: i18n().format.toPlainTime(unitValue, humanUnit)
    });
  };

  const getPresetListAsFlatString = () => {
    return props.notificationSettings.notifyAtBefore
      .map((preset) => getPresetLabel(preset))
      .join(', ');
  };

  return (
    <Box>
      <Heading as="h6" fontWeight={props.inTooltip ? '$normal' : undefined}>
        Notifications enabled (
        {props.notificationSettings.notifyAtBefore.length})
      </Heading>
      <Box mt={props.inTooltip ? '$2' : '0'} textTransform="lowercase">
        {props.eachItemOnNewLine ? (
          <For each={props.notificationSettings.notifyAtBefore}>
            {(preset) => <Box>{getPresetLabel(preset)}</Box>}
          </For>
        ) : (
          getPresetListAsFlatString()
        )}
      </Box>
    </Box>
  );
};

export default EnabledNotificationsPreview;
