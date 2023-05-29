import { Component, createSignal } from 'solid-js';
import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { profileService } from '../../lib/user/profile.service';
import { useUserCtx } from '../../lib/user/user.context';
import { userService } from '../../lib/user/user.service';

type DeleteMyProfileBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading'
>;

const DeleteMyProfileBtn: Component<DeleteMyProfileBtnProps> = (props) => {
  const [, { setUser }] = useUserCtx();
  const [isLoading, setIsLoading] = createSignal(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Your account and all data on the account will be deleted. You will be logged out. Proceed?'
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      await profileService.deleteMyProfile();

      notificationService.show({
        status: 'success',
        title: 'Your account was deleted'
      });

      await userService.signOut();
      setUser();
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: err.message
      });
    }

    setIsLoading(false);
  };

  return (
    <Button {...props} loading={isLoading()} onClick={handleDelete}>
      {props.children ?? 'Export all my birthdays'}
    </Button>
  );
};

export default DeleteMyProfileBtn;
