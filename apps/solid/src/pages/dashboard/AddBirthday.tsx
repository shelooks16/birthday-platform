import { notificationService } from '@hope-ui/solid';
import { BirthdayDocument } from '@shared/types';
import { Component } from 'solid-js';
import BirthdayForm from '../../components/birthday/BirthdayForm';
import PageTitle from '../../components/PageTitle';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';

const DashAddBirthday: Component = () => {
  const [, { mutate: mutateBirthdays }] = useBirthdaysCtx();

  const handleOnAfterSubmitForm = (createdBirthday: BirthdayDocument) => {
    mutateBirthdays((val) => (val ? val.concat(createdBirthday) : val));

    notificationService.show({
      status: 'success',
      title: `${createdBirthday.buddyName} was created`
    });
  };

  return (
    <div>
      <PageTitle>Add new birthday</PageTitle>
      <BirthdayForm onAfterSubmit={handleOnAfterSubmitForm} />
    </div>
  );
};

export default DashAddBirthday;
