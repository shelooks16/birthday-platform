import { Button, notificationService } from '@hope-ui/solid';
import { BirthdayDocument } from '@shared/types';
import { Component, createSignal } from 'solid-js';
import { useI18n } from '../../i18n.context';
import { birthdayService } from '../../lib/birthday/birthday.service';

type DeleteBirthdayBtnProps = {
  birthday: BirthdayDocument;
  onAfterDeleted?: (deleted: BirthdayDocument) => any;
};

const DeleteBirthdayBtn: Component<DeleteBirthdayBtnProps> = (props) => {
  const [i18n] = useI18n();
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleOnDelete = async () => {
    setIsDeleting(true);

    try {
      await birthdayService.deleteById(props.birthday.id);

      props.onAfterDeleted?.(props.birthday);
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: i18n().t('birthday.editBirthday.remove.error', {
          message: err.message
        })
      });
    }

    setIsDeleting(false);
  };

  return (
    <Button
      type="button"
      colorScheme="danger"
      variant="ghost"
      onClick={handleOnDelete}
      loading={isDeleting()}
    >
      {i18n().t('birthday.editBirthday.remove.btn', {
        buddyName: props.birthday.buddyName
      })}
    </Button>
  );
};

export default DeleteBirthdayBtn;
