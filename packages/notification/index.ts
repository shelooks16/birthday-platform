import { FrequencyUnit, NotifyBeforePreset } from '@shared/types';

type HumanUnit = 'year' | 'month' | 'day' | 'hour' | 'minute';

const freqUnitToHumanUnit: Record<FrequencyUnit, HumanUnit> = {
  [FrequencyUnit.months]: 'month',
  [FrequencyUnit.days]: 'day',
  [FrequencyUnit.hours]: 'hour',
  [FrequencyUnit.minutes]: 'minute'
};

export const parseNotifyBeforePreset = (preset: NotifyBeforePreset) => {
  const value = parseInt(preset, 10);
  const frequencyUnit = preset.replace(/\d/g, '') as FrequencyUnit;
  const humanUnit: HumanUnit = freqUnitToHumanUnit[frequencyUnit] ?? 'day';

  return {
    value,
    frequencyUnit,
    humanUnit
  };
};
