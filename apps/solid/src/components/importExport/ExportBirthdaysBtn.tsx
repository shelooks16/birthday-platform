import { Component, createSignal } from 'solid-js';
import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';

const downloadIntoFile = (
  data: string,
  fileNamePrefix: string,
  extension: 'json' | 'csv'
) => {
  const fileName = fileNamePrefix + '_' + Date.now() + '.' + extension;

  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
  );
  element.setAttribute('download', fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  return fileName;
};

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
      const birthdays = await birthdayService.exportBirthdays();

      const fileName = downloadIntoFile(
        JSON.stringify(birthdays, null, 2),
        'birthdays_export',
        'json'
      );

      notificationService.show({
        status: 'success',
        title: `Exported to ${fileName}`
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
