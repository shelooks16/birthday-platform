import { Component } from 'solid-js';
import {
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
import { Modal, ModalOverlay } from '../Modal';
import { waitForModalAnimation } from '../../lib/stitches.utils';
import { BirthdayDocument } from '@shared/types';
import ImportBirthdaysForm from './ImportBirthdaysForm';

type ExportBirthdaysBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading'
>;

const ImportBirthdaysBtn: Component<ExportBirthdaysBtnProps> = (props) => {
  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleSuccess = async (data: BirthdayDocument[]) => {
    onClose();
    await waitForModalAnimation();

    notificationService.show({
      status: 'success',
      title: `${data.length} birthdays were imported`
    });
  };

  return (
    <>
      <Button {...props} onClick={onOpen}>
        {props.children ?? 'Import birthdays'}
      </Button>
      <Modal
        opened={isOpen()}
        onClose={onClose}
        motionPreset="fade-in-bottom"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent mx="$1">
          <ModalCloseButton />
          <ModalHeader>Import birthdays</ModalHeader>
          <Divider />
          <ModalBody my="$2">
            <ImportBirthdaysForm onAfterSubmit={handleSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImportBirthdaysBtn;
