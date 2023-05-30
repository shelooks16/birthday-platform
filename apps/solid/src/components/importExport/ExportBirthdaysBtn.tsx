import { Component, createSignal } from 'solid-js';
import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';
import { useI18n } from '../../i18n.context';

type ExportBirthdaysBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading'
>;

const ExportBirthdaysBtn: Component<ExportBirthdaysBtnProps> = (props) => {
  const [i18n] = useI18n();
  const [isLoading, setIsLoading] = createSignal(false);
  const [profileCtx] = useUserProfileCtx();

  const onClick = async () => {
    if (profileCtx.error || !profileCtx.profile) return;

    if (!window.confirm(i18n().t('birthday.exportBirthdays.confirmation'))) {
      return;
    }

    setIsLoading(true);

    try {
      const { fileName, exportedBirthdays } =
        await birthdayService.exportBirthdays();

      notificationService.show({
        status: 'success',
        title: i18n().t('birthday.exportBirthdays.success', {
          count: exportedBirthdays.length,
          fileName
        })
      });
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: i18n().t('birthday.exportBirthdays.error', {
          message: err.message
        })
      });
    }

    setIsLoading(false);
  };

  return (
    <Button {...props} loading={isLoading()} onClick={onClick}>
      {i18n().t('birthday.exportBirthdays.btn')}
    </Button>
  );
};

export default ExportBirthdaysBtn;
