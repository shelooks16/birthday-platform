import {
  createSignal,
  onMount,
  For,
  untrack,
  createMemo,
  createDeferred,
  createResource
} from 'solid-js';
import {
  SimpleSelect,
  SimpleOption,
  SimpleSelectProps,
  Checkbox,
  Box
} from '@hope-ui/solid';
import { loadTzList } from '@shared/dates';
import { useI18n } from '../../i18n.context';

type Option = {
  value: string;
  label: string;
};

// *think* move tzList to database
const TimeZonePicker = (props: SimpleSelectProps) => {
  const [showAll, setShowAll] = createSignal(false);
  const [allTzList] = createResource(showAll, loadTzList, { initialValue: [] });
  const [i18n] = useI18n();
  const detectedTz = i18n().format.timeZone;
  const today = new Date();

  const [value, setValue] = createSignal(untrack(() => props.value));
  const [lastSelected, setLastSelected] = createSignal(
    untrack(() => (props.value === detectedTz ? '' : props.value))
  );

  const createOption = (timeZone: string): Option => {
    return {
      value: timeZone,
      label: i18n().format.dateToTimeZoneDescription(today, timeZone)
    };
  };

  const options = createMemo(() => {
    if (showAll()) {
      return allTzList.latest.map((tz) => createOption(tz));
    }

    if (lastSelected()) {
      return [createOption(lastSelected()), createOption(detectedTz)];
    }

    return [createOption(detectedTz)];
  });

  const optionsAsync = createDeferred(options);

  const updateValue = (v: string) => {
    if (v !== detectedTz) {
      setLastSelected(v);
    }
    setValue(v);
    props.onChange?.(v);
  };

  // autoselect user timezone
  onMount(() => {
    setValue((p) => {
      if (p) return p;
      const newVal = detectedTz;
      props.onChange?.(newVal);
      return newVal;
    });
  });

  return (
    <Box>
      <SimpleSelect {...props} value={value()} onChange={updateValue}>
        <For each={optionsAsync()}>
          {(item) => (
            <SimpleOption fontSize="$sm" value={item.value}>
              {item.label}
            </SimpleOption>
          )}
        </For>
      </SimpleSelect>
      <Checkbox
        mt="$2"
        checked={showAll()}
        onChange={(ev: any) => setShowAll(ev.target.checked)}
      >
        Display all time zones in dropdown
      </Checkbox>
    </Box>
  );
};

export default TimeZonePicker;
