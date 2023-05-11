import { IconProps } from '@hope-ui/solid';
import { ChannelType } from '@shared/types';
import { Component, Switch, Match, splitProps } from 'solid-js';
import { IconEmail, IconTelegram } from '../Icons';

type IconChannelTypeProps = {
  channelType: ChannelType;
} & IconProps<'svg'>;

const IconChannelType: Component<IconChannelTypeProps> = (props) => {
  const [localProps, iconProps] = splitProps(props, ['channelType']);

  return (
    <Switch>
      <Match when={localProps.channelType === ChannelType.email}>
        <IconEmail {...iconProps} />
      </Match>
      <Match when={localProps.channelType === ChannelType.telegram}>
        <IconTelegram {...iconProps} />
      </Match>
    </Switch>
  );
};

export default IconChannelType;
