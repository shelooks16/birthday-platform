import OptionalTooltip, { OptionalTooltipProps } from '../OptionalTooltip';
import { BirthdayNotificationSettings } from '@shared/types';
import { ParentComponent, splitProps } from 'solid-js';
import EnabledNotificationsPreview from './EnabledNotificationsPreview';
import { Box } from '@hope-ui/solid';

export type BirthdayNotificationsTooltipProps = {
  notificationSettings?: BirthdayNotificationSettings | null;
} & Pick<OptionalTooltipProps, 'closeOnClick' | 'placement'>;

export const BirthdayNotificationsTooltip: ParentComponent<
  BirthdayNotificationsTooltipProps
> = (props) => {
  const [tooltipProps, localProps] = splitProps(props, [
    'closeOnClick',
    'placement'
  ]);

  return (
    <OptionalTooltip
      {...tooltipProps}
      showWhen={!!localProps.notificationSettings?.notifyAtBefore.length}
      closeOnClick={tooltipProps.closeOnClick ?? false}
      offset={3}
      label={
        <Box maxW="250px">
          <EnabledNotificationsPreview
            notificationSettings={localProps.notificationSettings!}
            inTooltip
            eachItemOnNewLine
          />
        </Box>
      }
    >
      {localProps.children}
    </OptionalTooltip>
  );
};

export default BirthdayNotificationsTooltip;
