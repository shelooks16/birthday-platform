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

const resolveIsPreviewMode = () =>
  sessionStorage.getItem('previewMode') === 'true' || false;

export const throwIfPreviewMode = () => {
  if (resolveIsPreviewMode()) {
    throw new Error('You are looking at demo');
  }
};

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
