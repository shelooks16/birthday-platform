import { For, Component } from 'solid-js';
import { SimpleOption, SimpleSelect, SimpleSelectProps } from '@hope-ui/solid';
import { appConfig } from '../appConfig';

type LanguagePickerProps = SimpleSelectProps;

const LanguagePicker: Component<LanguagePickerProps> = (props) => {
  return (
    <SimpleSelect {...props}>
      <For each={appConfig.languages}>
        {(lang) => (
          <SimpleOption value={lang.locale}>{lang.label}</SimpleOption>
        )}
      </For>
    </SimpleSelect>
  );
};

export default LanguagePicker;
