import { ButtonGroup, IconButton } from '@hope-ui/solid';
import { createLocalStorage } from '@solid-primitives/storage';
import { Component, createEffect, createSignal, For, Signal } from 'solid-js';
import { appConfig } from '../appConfig';
import { IconCalendar, IconList } from './Icons';

export type View = 'list' | 'calendar';

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
  const views: ViewConfig[] = [
    {
      icon: <IconCalendar />,
      value: 'calendar',
      aria: 'Calendar view'
    },
    {
      icon: <IconList />,
      value: 'list',
      aria: 'List view'
    }
  ];

  return (
    <ButtonGroup attached>
      <For each={views}>
        {(item, idx) => (
          <IconButton
            aria-label={item.aria}
            title={item.aria}
            variant={props.value === item.value ? 'solid' : 'outline'}
            colorScheme="primary"
            mr={idx() !== views.length - 1 ? '-1px' : '0'}
            icon={item.icon}
            onClick={() => props.onChange(item.value)}
          />
        )}
      </For>
    </ButtonGroup>
  );
};

export default ViewPicker;
