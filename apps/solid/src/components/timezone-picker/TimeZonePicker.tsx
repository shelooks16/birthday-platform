import { createSignal, onMount, For, untrack } from 'solid-js';
import { SimpleSelect, SimpleOption, SimpleSelectProps } from '@hope-ui/solid';
import { getTimezoneOffset } from '@shared/dates';
import { useI18n } from '../../i18n.context';

const TIMEZONES = ['Europe/Kyiv'];

type Option = {
  value: string;
  label: string;
};

const createOpt = (tz: string): Option => {
  const offset = getTimezoneOffset(tz) / 60;
  // const label = `(GMT +1:00) blabla (Europe/Kiev)`;
  const label = `(GMT${offset >= 0 ? '+' + offset : offset}:00) - ${tz}`;

  return {
    value: tz,
    label
  };
};

const TimeZonePicker = (props: SimpleSelectProps) => {
  const [value, setValue] = createSignal(untrack(() => props.value));
  const [options, setOptions] = createSignal<Option[]>([]);
  const [i18n] = useI18n();

  const updateValue = (v: string) => {
    setValue(v);
    props.onChange?.(v);
  };

  const createOptions = () => {
    const detectedTz = i18n().format.timeZone;

    const list = TIMEZONES.map((tz) => createOpt(tz));

    if (!list.some((v) => v.value === detectedTz)) {
      list.push(createOpt(detectedTz));
    }

    return {
      options: list.sort((a, b) => -1),
      detectedTz
    };
  };

  onMount(() => {
    const result = createOptions();

    setOptions(result.options);
    setValue((p) => {
      if (p) return p;
      const newVal = result.detectedTz;
      props.onChange?.(newVal);
      return newVal;
    });
  });

  return (
    <SimpleSelect {...props} value={value()} onChange={updateValue}>
      <For each={options()}>
        {(item) => <SimpleOption value={item.value}>{item.label}</SimpleOption>}
      </For>
    </SimpleSelect>
  );
};

export default TimeZonePicker;
