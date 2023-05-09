import { For, Component } from 'solid-js';
import { useI18n } from '../i18n.context';
import { SimpleOption, SimpleSelect, SimpleSelectProps } from '@hope-ui/solid';
import { appConfig } from '../appConfig';

const LanguagePicker: Component<SimpleSelectProps> = (props) => {
  const [, { locale }] = useI18n();

  return (
    <SimpleSelect {...props} value={locale()} onChange={locale}>
      <For each={appConfig.languages}>
        {(lang) => (
          <SimpleOption value={lang.locale}>{lang.label}</SimpleOption>
        )}
      </For>
    </SimpleSelect>
  );
};

export default LanguagePicker;
