/* eslint-disable solid/no-innerhtml */
import {
  Box,
  Button,
  ButtonProps,
  createDisclosure,
  Divider,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  notificationService
} from '@hope-ui/solid';
import { createSignal, ParentComponent, splitProps } from 'solid-js';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { useCopyToClipboard } from '../../lib/clipboard/useCopyToClipboard';
import { waitForModalAnimation } from '../../lib/stitches.utils';
import { Modal, ModalOverlay } from '../Modal';

type GenerateBirthdayWishBtnProps = {
  birthdayId: string;
  onBeforeOpen?: () => any;
  onAfterClose?: () => any;
} & ButtonProps;

const GenerateBirthdayWishBtn: ParentComponent<GenerateBirthdayWishBtnProps> = (
  props
) => {
  const [localProps, btnProps] = splitProps(props, [
    'birthdayId',
    'onBeforeOpen',
    'onAfterClose'
  ]);
  const { isOpen, onOpen, onClose } = createDisclosure();
  const [text, setText] = createSignal('');
  const { copyToClipboard, hasCopied } = useCopyToClipboard(text);
  const [isLoading, setIsLoading] = createSignal(false);

  const generate = async () => {
    setIsLoading(true);

    try {
      const result = await birthdayService.generateBirthdayWish({
        birthdayId: localProps.birthdayId
      });

      setText(result.text!);
      setIsLoading(false);

      localProps.onBeforeOpen?.();
      onOpen();
    } catch (err) {
      setIsLoading(false);
      notificationService.show({
        status: 'danger',
        title: err.message
      });
    }
  };

  const handleClose = async () => {
    onClose();
    await waitForModalAnimation();
    localProps.onAfterClose?.();
  };

  return (
    <>
      <Button {...btnProps} onClick={generate} loading={isLoading()}>
        Поздравить {props.children}
      </Button>

      <Modal
        opened={isOpen()}
        onClose={handleClose}
        motionPreset="fade-in-bottom"
        scrollBehavior="inside"
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Special birthday wish</ModalHeader>
          <Divider />
          <ModalBody my="$2">
            <Box innerHTML={text()} />

            <Button mt="$4" size="sm" onClick={copyToClipboard}>
              {hasCopied() ? 'Текст скопирован' : 'Скопировать'}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateBirthdayWishBtn;
