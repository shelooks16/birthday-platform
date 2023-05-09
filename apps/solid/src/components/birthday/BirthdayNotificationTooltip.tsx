import { Box } from '@hope-ui/solid';
import OptionalTooltip, { OptionalTooltipProps } from '../OptionalTooltip';
import { BirthdayNotificationSettings } from '@shared/types';
import { ParentComponent, splitProps } from 'solid-js';

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
        <div>
          <div>
            Нотификации включены (
            {localProps.notificationSettings!.notifyAtBefore.length})
          </div>
          <Box mt="$2">За 1 день до</Box>
          {/* {localProps.notificationSettings.notifyAtBefore} */}
        </div>
      }
    >
      {localProps.children}
    </OptionalTooltip>
  );
};

export default BirthdayNotificationsTooltip;
