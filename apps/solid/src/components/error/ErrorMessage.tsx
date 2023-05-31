import {
  Alert,
  Box,
  Button,
  HTMLHopeProps,
  notificationService
} from '@hope-ui/solid';
import { ParentComponent, Show, createSignal, splitProps } from 'solid-js';
import { useI18n } from '../../i18n.context';

type ErrorMessageProps = {
  action?: (() => any) | 'refresh';
} & HTMLHopeProps<'div'>;

const ErrorMessage: ParentComponent<ErrorMessageProps> = (props) => {
  const [localProps, boxProps] = splitProps(props, ['action']);
  const [i18n] = useI18n();
  const [isLoading, setIsLoading] = createSignal(false);

  const isFnAction = () => typeof localProps.action === 'function';

  const handleAction = async () => {
    if (!isFnAction()) {
      window.location.reload();
      return;
    }

    setIsLoading(true);

    try {
      await (localProps.action as any)();
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: err.message
      });
    }

    setIsLoading(false);
  };

  return (
    <Box {...boxProps}>
      <Alert status="danger">{boxProps.children}</Alert>
      <Show when={!!localProps.action}>
        <Box textAlign="center">
          <Button onClick={handleAction} loading={isLoading()} mt="$4">
            {isFnAction()
              ? i18n().t('errors.errorAction.retry')
              : i18n().t('errors.errorAction.refresh')}
          </Button>
        </Box>
      </Show>
    </Box>
  );
};

export default ErrorMessage;
