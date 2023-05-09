import { Button } from '@hope-ui/solid';
import { BirthdayDocument } from '@shared/types';
import { Component, createSignal } from 'solid-js';
import { birthdayService } from '../../lib/birthday/birthday.service';

type DeleteBirthdayBtnProps = {
  birthday: BirthdayDocument;
  onAfterDeleted?: (deleted: BirthdayDocument) => any;
  onError?: <T = Error>(error: T) => any;
};

const DeleteBirthdayBtn: Component<DeleteBirthdayBtnProps> = (props) => {
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleOnDelete = async () => {
    setIsDeleting(true);

    try {
      await birthdayService.deleteBirthdayById(props.birthday.id);

      props.onAfterDeleted?.(props.birthday);
    } catch (err) {
      if (props.onError) {
        props.onError(err);
      } else {
        throw err;
      }
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
      Remove {props.birthday.buddyName}
    </Button>
  );
};

export default DeleteBirthdayBtn;
