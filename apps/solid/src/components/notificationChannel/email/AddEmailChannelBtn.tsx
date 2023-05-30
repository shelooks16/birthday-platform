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
import { useI18n } from '../../../i18n.context';

type AddEmailChannelBtnProps = Omit<ButtonProps, 'onClick'>;

const AddEmailChannelBtn: Component<AddEmailChannelBtnProps> = (props) => {
  const [i18n] = useI18n();
  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleSuccess = async (data: ConfirmEmailOtpResult) => {
    onClose();

    notificationService.show({
      status: 'success',
      title: i18n().t('notificationChannel.email.addNew.success', {
        email: data.channel.value
      })
    });
  };

  return (
    <>
      <Button {...props} onClick={onOpen}>
        {i18n().t('notificationChannel.email.addNew.btn')}
      </Button>
      <Modal
        opened={isOpen()}
        onClose={onClose}
        motionPreset="fade-in-bottom"
        scrollBehavior="inside"
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent mx="$1">
          <ModalCloseButton />
          <ModalHeader>
            {i18n().t('notificationChannel.email.addNew.btn')}
          </ModalHeader>
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
