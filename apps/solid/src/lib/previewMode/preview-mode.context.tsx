import { notificationService } from '@hope-ui/solid';
import { createSessionStorage } from '@solid-primitives/storage';
import {
  createContext,
  ParentProps,
  useContext,
  createSignal,
  Accessor
} from 'solid-js';

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
              throw new Error('You are looking at demo');
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
  const [settings, setSettings, settingsAction] = createSessionStorage({});
  const [isPreviewMode, setIsPreviewMode] = createSignal(
    settings.previewMode === 'true' || false
  );

  const disablePreviewMode = () => {
    setIsPreviewMode(false);
    settingsAction.remove('previewMode');
    notificationService.show({
      status: 'info',
      title: 'Exited demo'
    });
  };

  const enablePreviewMode = () => {
    setIsPreviewMode(true);
    setSettings('previewMode', 'true');
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
