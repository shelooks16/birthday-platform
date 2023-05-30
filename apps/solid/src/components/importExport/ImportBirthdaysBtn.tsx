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
import { useI18n } from '../../i18n.context';

type ExportBirthdaysBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading'
>;

const ImportBirthdaysBtn: Component<ExportBirthdaysBtnProps> = (props) => {
  const [i18n] = useI18n();
  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleSuccess = async (data: BirthdayDocument[]) => {
    onClose();
    await waitForModalAnimation();

    notificationService.show({
      status: 'success',
      title: i18n().t('birthday.importBirthdays.success', {
        count: data.length
      })
    });
  };

  return (
    <>
      <Button {...props} onClick={onOpen}>
        {i18n().t('birthday.importBirthdays.btn')}
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
          <ModalHeader>{i18n().t('birthday.importBirthdays.btn')}</ModalHeader>
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
