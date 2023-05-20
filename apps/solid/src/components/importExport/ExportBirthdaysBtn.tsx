import { Component, createSignal } from 'solid-js';
import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';

type ExportBirthdaysBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading'
>;

const ExportBirthdaysBtn: Component<ExportBirthdaysBtnProps> = (props) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [profileCtx] = useUserProfileCtx();

  const onClick = async () => {
    if (profileCtx.error || !profileCtx.profile) return;

    if (
      !window.confirm(
        'Birthdays will be exported into a file on your device in JSON format. OK?'
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const { fileName, exportedBirthdays } =
        await birthdayService.exportBirthdays();

      notificationService.show({
        status: 'success',
        title: `Exported ${exportedBirthdays.length} birthdays to ${fileName}`
      });
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: err.message
      });
    }

    setIsLoading(false);
  };

  return (
    <Button {...props} loading={isLoading()} onClick={onClick}>
      {props.children ?? 'Export all my birthdays'}
    </Button>
  );
};

export default ExportBirthdaysBtn;
