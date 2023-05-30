import { notificationService } from '@hope-ui/solid';
import { createSessionStorage } from '@solid-primitives/storage';
import {
  createContext,
  ParentProps,
  useContext,
  createSignal,
  Accessor
} from 'solid-js';
import { resolveCurrentI18nInstance, useI18n } from '../../i18n.context';

type PreviewModeActions = {
  disablePreviewMode: () => void;
  enablePreviewMode: () => void;
};
type IPreviewModeCtx = [Accessor<boolean>, PreviewModeActions];

export const PreviewModeCtx = createContext<IPreviewModeCtx>();
export const usePreviewModeCtx = () =>
  useContext(PreviewModeCtx) as IPreviewModeCtx;

const resolveIsPreviewMode = () => {
  try {
    return sessionStorage.getItem('previewMode') === 'true' || false;
  } catch (err) {
    return false;
  }
};

/** Intercept method calls. If preview mode is enabled, throw an error */
export function previewModeProxy<T extends Record<string | symbol, any>>(
  obj: T,
  ignoreKeys?: string[]
) {
  return new Proxy(obj, {
    get(target, prop) {
      if (typeof target[prop] === 'function') {
        return new Proxy(target[prop], {
          apply: (target, thisArg, argumentsList) => {
            if (
              !ignoreKeys?.includes(prop as string) &&
              resolveIsPreviewMode()
            ) {
              const msg =
                resolveCurrentI18nInstance()?.t?.('previewMode.previewTitle') ||
                'You are looking at demo';

              throw new Error(msg);
            }

            return Reflect.apply(target, thisArg, argumentsList);
          }
        });
      } else {
        return Reflect.get(target, prop);
      }
    }
  });
}

export function PreviewModeContextProvider(props: ParentProps) {
  const [i18n] = useI18n();
  const [settings, setSettings, settingsAction] = createSessionStorage({});
  const [isPreviewMode, setIsPreviewMode] = createSignal(
    settings.previewMode === 'true' || false
  );

  const disablePreviewMode = () => {
    settingsAction.remove('previewMode');
    setIsPreviewMode(false);
    notificationService.show({
      status: 'info',
      title: i18n().t('previewMode.exitPreview.success')
    });
  };

  const enablePreviewMode = () => {
    setSettings('previewMode', 'true');
    setIsPreviewMode(true);
  };

  const ctx: IPreviewModeCtx = [
    isPreviewMode,
    { enablePreviewMode, disablePreviewMode }
  ];

  return (
    <PreviewModeCtx.Provider value={ctx}>
      {props.children}
    </PreviewModeCtx.Provider>
  );
}
