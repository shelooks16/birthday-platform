import { Component, createSignal } from 'solid-js';
import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { profileService } from '../../lib/user/profile.service';
import { useUserCtx } from '../../lib/user/user.context';
import { userService } from '../../lib/user/user.service';
import { useI18n } from '../../i18n.context';

type DeleteMyProfileBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading' | 'children'
>;

const DeleteMyProfileBtn: Component<DeleteMyProfileBtnProps> = (props) => {
  const [i18n] = useI18n();
  const [, { setUser }] = useUserCtx();
  const [isLoading, setIsLoading] = createSignal(false);

  const handleDelete = async () => {
    if (!window.confirm(i18n().t('profile.deleteProfile.confirmation'))) {
      return;
    }

    setIsLoading(true);

    try {
      await profileService.deleteMyProfile();

      notificationService.show({
        status: 'success',
        title: i18n().t('profile.deleteProfile.success')
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
      {i18n().t('profile.deleteProfile.btn')}
    </Button>
  );
};

export default DeleteMyProfileBtn;
