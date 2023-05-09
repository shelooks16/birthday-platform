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

type EditNotificationChannelsBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick'
> & {
  onAfterClose?: () => any;
};

const EditNotificationChannelsBtn: Component<
  EditNotificationChannelsBtnProps
> = (props) => {
  const [localProps, btnProps] = splitProps(props, ['onAfterClose']);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleClose = async () => {
    onClose();
    await waitForDrawerAnimation();
    localProps.onAfterClose?.();
  };

  return (
    <>
      <Button {...btnProps} onClick={onOpen} />
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
          <DrawerHeader>Edit LOL</DrawerHeader>

          <DrawerBody>
            <EditNotificationChannels isInModal />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default EditNotificationChannelsBtn;
