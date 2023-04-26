export enum ChannelType {
  email = 'email',
  telegram = 'telegram'
}

function createChannel(type: ChannelType) {
  return {
    isValid: (channel: any) => channel.startsWith(type),
    isType: (channelType: any) => channelType === type,
    make: (id: string | number, displayName?: string) =>
      [type, id, displayName].filter(Boolean).join(':')
  };
}

export const telegramChannel = createChannel(ChannelType.telegram);
export const emailChannel = createChannel(ChannelType.email);

export const parseChannel = (channel: string) => {
  const [type, id, displayName] = channel.split(':');

  return {
    type: type as ChannelType,
    id,
    displayName: displayName as string | undefined
  };
};

export const channelToDisplayName = (value: string) => {
  const { type, id, displayName } = parseChannel(value);

  return displayName ?? id ?? type;
};
