import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { usePreviewModeCtx } from '../lib/previewMode/preview-mode.context';

type ExitPreviewModeBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'children'
>;

const ExitPreviewModeBtn: Component<ExitPreviewModeBtnProps> = (props) => {
  const [, { disablePreviewMode }] = usePreviewModeCtx();

  return (
    <Button {...props} onClick={disablePreviewMode}>
      Click to exit demo account
    </Button>
  );
};

export default ExitPreviewModeBtn;
