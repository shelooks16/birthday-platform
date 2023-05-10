import {
  Box,
  Button,
  ButtonProps,
  createDisclosure,
  Divider,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  Heading,
  HStack,
  Text,
  VStack
} from '@hope-ui/solid';
import { Drawer, DrawerOverlay } from '../../Modal';
import { BirthdayDocument } from '@shared/types';
import { Component, For, splitProps, Show, createMemo } from 'solid-js';
import GenerateBirthdayWishBtn from '../GenerateBirthdayWishBtn';
import EditBirthdayBtn from '../EditBirthdayBtn';
import { IconBell } from '../../Icons';
import { useI18n } from '../../../i18n.context';
import EnabledNotificationsPreview from '../EnabledNotificationsPreview';

type BirthInfoItemProps = {
  birthday: BirthdayDocument;
  targetDate: Date;
  showGenerateWish?: boolean;
};

const BirthInfoItem: Component<BirthInfoItemProps> = (props) => {
  const [i18n] = useI18n();

  return (
    <Box>
      <HStack gap="$2" alignItems="center" position="relative">
        <Heading fontWeight="$semibold" as="h2" size="xl">
          {props.birthday.buddyName}
        </Heading>
        <EditBirthdayBtn birthday={props.birthday} />
      </HStack>

      <HStack spacing="$2" color="$neutral10">
        <Box
          fontWeight="$bold"
          letterSpacing="$wide"
          fontSize="$xs"
          textTransform="uppercase"
        >
          {i18n().format.toPlainTime(
            props.targetDate.getFullYear() - props.birthday.birth.year,
            'year'
          )}
        </Box>
      </HStack>

      <Show when={props.birthday.buddyDescription}>
        <Text size="sm" mt="$2">
          {props.birthday.buddyDescription}
        </Text>
      </Show>

      <Show when={props.birthday.notificationSettings?.notifyAtBefore}>
        <Box fontSize="$xs" mt="$2">
          <HStack gap="$2" alignItems="baseline">
            <Box>
              <IconBell color="$neutral10" />
            </Box>
            <EnabledNotificationsPreview
              notificationSettings={props.birthday.notificationSettings!}
            />
          </HStack>
        </Box>
      </Show>

      <Show when={props.showGenerateWish}>
        <Box mt="$4">
          <GenerateBirthdayWishBtn
            birthdayId={props.birthday.id}
            size="sm"
            colorScheme="accent"
            variant="subtle"
          >
            {props.birthday.buddyName}
          </GenerateBirthdayWishBtn>
        </Box>
      </Show>
    </Box>
  );
};

type MobileInfoBtnProps = {
  birthdays: BirthdayDocument[];
  targetDate: Date;
  showGenerateWish?: boolean;
} & ButtonProps<'button'>;

const MobileInfoBtn: Component<MobileInfoBtnProps> = (props) => {
  const [localProps, btnProps] = splitProps(props, [
    'birthdays',
    'targetDate',
    'showGenerateWish'
  ]);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const [i18n] = useI18n();

  const formatted = createMemo(() => {
    return {
      date: i18n().format.dateToDayMonthYear(localProps.targetDate),
      zodiacSign: i18n().format.dateToZodiacSign(localProps.targetDate),
      daysLeft: i18n().format.dateToDaysDiff(localProps.targetDate)
    };
  });

  return (
    <>
      <Button {...btnProps} onClick={onOpen} />
      <Drawer
        opened={isOpen()}
        onClose={onClose}
        placement="bottom"
        blockScrollOnMount={false}
      >
        <DrawerOverlay />
        <DrawerContent
          maxHeight="calc(100% - 10px)"
          minHeight="40%"
          borderTopRadius="$xl"
        >
          <DrawerCloseButton size="sm" />
          <DrawerHeader>
            <Box>{formatted().date}</Box>
            <HStack spacing="$2" color="$neutral10">
              <Show when={formatted().daysLeft.days}>
                <Box
                  fontWeight="$bold"
                  letterSpacing="$wide"
                  fontSize="$xs"
                  textTransform="uppercase"
                >
                  {formatted().daysLeft.phrase}
                </Box>
                &bull;
              </Show>
              <Box
                fontWeight="$bold"
                letterSpacing="$wide"
                fontSize="$xs"
                textTransform="uppercase"
              >
                {formatted().zodiacSign}
              </Box>
            </HStack>
          </DrawerHeader>
          <Divider />
          <DrawerBody my="$2" zIndex="9999999">
            <VStack spacing="$8" alignItems="stretch">
              <For each={localProps.birthdays}>
                {(item) => (
                  <BirthInfoItem
                    birthday={item}
                    targetDate={localProps.targetDate}
                    showGenerateWish={localProps.showGenerateWish}
                  />
                )}
              </For>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileInfoBtn;
