import { ChannelType, NotifyBeforePreset } from '@shared/types';

export const getNotifyBeforePresets = (): NotifyBeforePreset[] => [
  '30m',
  '1h',
  '6h',
  '1d',
  '3d',
  '7d',
  '1M'
];

export const getNotificationChannelTypes = (): ChannelType[] => [
  ChannelType.email,
  ChannelType.telegram
];
