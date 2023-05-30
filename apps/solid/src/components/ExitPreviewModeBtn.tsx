import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { usePreviewModeCtx } from '../lib/previewMode/preview-mode.context';
import { useI18n } from '../i18n.context';

type ExitPreviewModeBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'children'
>;

const ExitPreviewModeBtn: Component<ExitPreviewModeBtnProps> = (props) => {
  const [i18n] = useI18n();
  const [, { disablePreviewMode }] = usePreviewModeCtx();

  return (
    <Button {...props} onClick={disablePreviewMode}>
      {i18n().t('previewMode.exitPreview.btn')}
    </Button>
  );
};

export default ExitPreviewModeBtn;
