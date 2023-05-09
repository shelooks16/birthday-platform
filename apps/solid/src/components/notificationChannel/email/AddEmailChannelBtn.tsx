import type { Component } from 'solid-js';
import {
  Button,
  ButtonProps,
  Divider,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  createDisclosure,
  notificationService
} from '@hope-ui/solid';
import AddEmailForm from './AddEmailForm';
import { ConfirmEmailOtpResult } from '@shared/types';
import { Modal, ModalOverlay } from '../../Modal';

type AddEmailChannelBtnProps = Omit<ButtonProps, 'onClick'>;

const AddEmailChannelBtn: Component<AddEmailChannelBtnProps> = (props) => {
  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleSuccess = async (data: ConfirmEmailOtpResult) => {
    onClose();

    notificationService.show({
      status: 'success',
      title: 'Email verified',
      description: `Added ${data.channel.value}`
    });
  };

  return (
    <>
      <Button {...props} onClick={onOpen} />
      <Modal
        opened={isOpen()}
        onClose={onClose}
        motionPreset="fade-in-bottom"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent mx="$1">
          <ModalCloseButton />
          <ModalHeader>Add email</ModalHeader>
          <Divider />
          <ModalBody my="$2">
            <AddEmailForm onAfterSubmit={handleSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddEmailChannelBtn;
