import {
  Box,
  createDisclosure,
  Divider,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  IconButton,
  IconButtonProps,
  notificationService
} from '@hope-ui/solid';
import { Component, splitProps } from 'solid-js';
import { BirthdayDocument } from '@shared/types';
import { Drawer, DrawerOverlay } from '../Modal';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';
import { waitForDrawerAnimation } from '../../lib/stitches.utils';
import { IconEdit } from '../Icons';
import BirthdayForm from './BirthdayForm';
import DeleteBirthdayBtn from './DeleteBirthdayBtn';

type EditBirthdayBtnProps = Omit<
  IconButtonProps<'button'>,
  'icon' | 'aria-label'
> & {
  birthday: BirthdayDocument;
  onBeforeOpen?: () => any;
  onAfterClose?: (isBirthdayAffected: boolean) => any;
};

const EditBirthdayBtn: Component<EditBirthdayBtnProps> = (props) => {
  const [localProps, btnProps] = splitProps(props, [
    'birthday',
    'onBeforeOpen',
    'onAfterClose'
  ]);
  const [, { mutate: mutateBirthdays }] = useBirthdaysCtx();

  const { isOpen, onOpen, onClose } = createDisclosure();

  const handleOpen = () => {
    localProps.onBeforeOpen?.();
    onOpen();
  };

  const handleClose = async (isAffected = false) => {
    onClose();
    await waitForDrawerAnimation();
    localProps.onAfterClose?.(isAffected);
  };

  const handleOnAfterUpdated = async (updatedBirthday: BirthdayDocument) => {
    await handleClose(true);

    mutateBirthdays((list) =>
      list
        ? list.map((item) =>
            item.id === updatedBirthday.id ? updatedBirthday : item
          )
        : list
    );

    notificationService.show({
      status: 'success',
      title: `${updatedBirthday.buddyName} updated`
    });
  };

  const handleOnAfterDeleted = async (deletedBirthday: BirthdayDocument) => {
    await handleClose(true);

    mutateBirthdays((list) =>
      list ? list.filter((item) => item.id !== deletedBirthday.id) : list
    );

    notificationService.show({
      status: 'success',
      title: `${deletedBirthday.buddyName} was removed`
    });
  };

  return (
    <>
      <IconButton
        size="xs"
        colorScheme="neutral"
        variant="ghost"
        {...btnProps}
        aria-label={`Edit ${localProps.birthday.buddyName}`}
        onClick={handleOpen}
        icon={<IconEdit />}
        appearance="auto"
        d="block"
      />
      <Drawer
        opened={isOpen()}
        placement="left"
        size="lg"
        onClose={handleClose}
        blockScrollOnMount={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit {localProps.birthday.buddyName}</DrawerHeader>

          <DrawerBody>
            <BirthdayForm
              birthdayId={localProps.birthday.id}
              initialData={{
                day: localProps.birthday.birth.day,
                month: localProps.birthday.birth.month,
                year: localProps.birthday.birth.year,
                description: localProps.birthday.buddyDescription,
                name: localProps.birthday.buddyName,
                setupNotifications: !!localProps.birthday.notificationSettings,
                notifyAtBefore:
                  localProps.birthday.notificationSettings?.notifyAtBefore,
                notifyChannelsIds:
                  localProps.birthday.notificationSettings?.notifyChannelsIds,
                timeZone: localProps.birthday.notificationSettings?.timeZone
              }}
              onAfterSubmit={handleOnAfterUpdated}
            />

            <Box textAlign="center" mt="$12">
              <Divider mb="$8" />
              <DeleteBirthdayBtn
                birthday={localProps.birthday}
                onAfterDeleted={handleOnAfterDeleted}
              />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default EditBirthdayBtn;
