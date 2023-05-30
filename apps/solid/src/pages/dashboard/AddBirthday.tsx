import { Box, IconButton, notificationService } from '@hope-ui/solid';
import { BirthdayDocument } from '@shared/types';
import { A } from '@solidjs/router';
import { Component } from 'solid-js';
import BirthdayForm from '../../components/birthday/BirthdayForm';
import { IconArrowLeft } from '../../components/Icons';
import PageTitle from '../../components/PageTitle';
import { useI18n } from '../../i18n.context';
import { ROUTE_PATH } from '../../routes';

const DashAddBirthday: Component = () => {
  const [i18n] = useI18n();

  const handleOnAfterAdded = (createdBirthday: BirthdayDocument) => {
    notificationService.show({
      status: 'success',
      title: i18n().t('birthday.addBirthday.success', {
        buddyName: createdBirthday.buddyName
      })
    });
  };

  return (
    <div>
      <PageTitle>{i18n().t('pages.addBirthday.title')}</PageTitle>
      <Box textAlign="center" mb="$2">
        <IconButton
          aria-label="dsa"
          variant="ghost"
          colorScheme="neutral"
          rounded="$full"
          icon={<IconArrowLeft fontSize="$xl" />}
          as={A}
          href={ROUTE_PATH.birthday}
        />
      </Box>
      <BirthdayForm onAfterSubmit={handleOnAfterAdded} />
    </div>
  );
};

export default DashAddBirthday;
