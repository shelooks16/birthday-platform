import { ButtonGroup, IconButton, Tooltip } from '@hope-ui/solid';
import { createLocalStorage } from '@solid-primitives/storage';
import { Component, createEffect, createSignal, For, Signal } from 'solid-js';
import { appConfig } from '../appConfig';
import { useI18n } from '../i18n.context';
import { IconBell, IconCalendar, IconList } from './Icons';

export type View = 'list' | 'calendar' | 'notifications';

export const useView = (): Signal<View> => {
  const [savedView, setSaveView] = createLocalStorage();
  const [view, setView] = createSignal<View>(
    (savedView.view as View) || appConfig.defaultBirthdaysView
  );

  createEffect(() => {
    setSaveView('view', view());
  });

  return [view, setView];
};

type ViewConfig = { icon: any; value: View; aria: string };

type ViewPickerProps = {
  value: View;
  onChange: (view: View) => any;
};

const ViewPicker: Component<ViewPickerProps> = (props) => {
  const [i18n] = useI18n();

  const views: ViewConfig[] = [
    {
      icon: <IconCalendar />,
      value: 'calendar',
      aria: i18n().t('birthday.views.calendar')
    },
    {
      icon: <IconList />,
      value: 'list',
      aria: i18n().t('birthday.views.list')
    },
    {
      icon: <IconBell />,
      value: 'notifications',
      aria: i18n().t('birthday.views.notifications')
    }
  ];

  return (
    <ButtonGroup attached>
      <For each={views}>
        {(item, idx) => (
          <Tooltip
            label={item.aria}
            display={{ '@initial': 'none', '@lg': 'block' }}
            openDelay={400}
            closeOnMouseDown
          >
            <IconButton
              aria-label={item.aria}
              variant={props.value === item.value ? 'solid' : 'outline'}
              colorScheme="primary"
              mr={idx() !== views.length - 1 ? '-1px' : '0'}
              icon={item.icon}
              onClick={() => props.onChange(item.value)}
            />
          </Tooltip>
        )}
      </For>
    </ButtonGroup>
  );
};

export default ViewPicker;
