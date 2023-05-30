import {
  Button,
  ButtonProps,
  createDisclosure,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader
} from '@hope-ui/solid';
import { Component, splitProps } from 'solid-js';
import { Drawer, DrawerOverlay } from '../Modal';
import { waitForDrawerAnimation } from '../../lib/stitches.utils';
import EditNotificationChannels from './EditNotificationChannels';
import { useI18n } from '../../i18n.context';

type EditNotificationChannelsBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'children'
> & {
  onAfterClose?: () => any;
};

const EditNotificationChannelsBtn: Component<
  EditNotificationChannelsBtnProps
> = (props) => {
  const [i18n] = useI18n();
  const [localProps, btnProps] = splitProps(props, ['onAfterClose']);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleClose = async () => {
    onClose();
    await waitForDrawerAnimation();
    localProps.onAfterClose?.();
  };

  return (
    <>
      <Button {...btnProps} onClick={onOpen}>
        {i18n().t('notificationChannel.title')}
      </Button>
      <Drawer
        opened={isOpen()}
        placement="right"
        size="lg"
        onClose={handleClose}
        blockScrollOnMount={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader> {i18n().t('notificationChannel.title')}</DrawerHeader>

          <DrawerBody>
            <EditNotificationChannels isInModal />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default EditNotificationChannelsBtn;
