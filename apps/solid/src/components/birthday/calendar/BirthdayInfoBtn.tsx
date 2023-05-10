import {
  Box,
  Button,
  HStack,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  ButtonProps,
  Text,
  SystemStyleObject
} from '@hope-ui/solid';
import {
  Component,
  splitProps,
  createMemo,
  createSignal,
  Show
} from 'solid-js';
import { BirthdayDocument } from '@shared/types';
import GenerateBirthdayWishBtn from '../GenerateBirthdayWishBtn';
import EditBirthdayBtn from '../EditBirthdayBtn';
import { IconBell } from '../../Icons';
import { useI18n } from '../../../i18n.context';

type BirthdayInfoBtnProps = {
  birthday: BirthdayDocument;
  currentYear: number;
  isPastBirthday?: boolean;
  showGenerateWish?: boolean;
} & ButtonProps<'button'>;

const BirthdayInfoBtn: Component<BirthdayInfoBtnProps> = (props) => {
  const [localProps, btnProps] = splitProps(props, [
    'birthday',
    'currentYear',
    'isPastBirthday',
    'showGenerateWish'
  ]);
  const [closeOnBlur, setCloseOnBlur] = createSignal(true);
  const onBeforeOpen = () => setCloseOnBlur(false);
  const onAfterClose = () => setCloseOnBlur(true);

  const [i18n] = useI18n();

  const formatted = createMemo(() => {
    const date = new Date(
      localProps.currentYear,
      localProps.birthday.birth.month,
      localProps.birthday.birth.day
    );

    return {
      birthDate: i18n().format.dateToDayMonthYear(date),
      zodiacSign: i18n().format.dateToZodiacSign(date),
      daysLeft: i18n().format.dateToDaysDiff(date),
      age: i18n().format.toPlainTime(
        localProps.birthday.birth.year - localProps.currentYear,
        'year'
      )
    };
  });

  const popoverCss = createMemo(() => {
    const styles: SystemStyleObject = {};

    if (!localProps.isPastBirthday) {
      styles.border = localProps.showGenerateWish
        ? '2px dashed $accent8'
        : '1px solid $accent8';
      styles.background = '$accent1';
    }

    return styles;
  });

  return (
    <Popover placement="right-start" closeOnBlur={closeOnBlur()}>
      <PopoverTrigger as={Button} {...btnProps}>
        <Box
          as="span"
          css={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          {localProps.birthday.buddyName}
        </Box>
      </PopoverTrigger>
      <PopoverContent maxW="$sm" zIndex="$banner" css={popoverCss()}>
        <PopoverHeader border="0">
          <HStack gap="$2" alignItems="center">
            <Heading fontWeight="$semibold" as="h2" size="2xl">
              {localProps.birthday.buddyName}
            </Heading>
            <EditBirthdayBtn
              birthday={localProps.birthday}
              onBeforeOpen={onBeforeOpen}
              onAfterClose={onAfterClose}
            />
          </HStack>
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <HStack spacing="$2" color="$neutral10" flexWrap="wrap">
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
              {formatted().age}
            </Box>
            &bull;
            <Box
              fontWeight="$bold"
              letterSpacing="$wide"
              fontSize="$xs"
              textTransform="uppercase"
            >
              {formatted().zodiacSign}
            </Box>
            &bull;
            <Box
              fontWeight="$bold"
              letterSpacing="$wide"
              fontSize="$xs"
              textTransform="uppercase"
            >
              {formatted().birthDate}
            </Box>
          </HStack>

          <Show when={localProps.birthday.buddyDescription}>
            <Text size="sm" mt="$2">
              {localProps.birthday.buddyDescription}
            </Text>
          </Show>

          <Show when={props.birthday.notificationSettings?.notifyAtBefore}>
            <Box fontSize="$xs" mt="$2">
              <HStack gap="$2" alignItems="baseline">
                <Box>
                  <IconBell color="$accent9" />
                </Box>
                <Box>
                  <Heading as="h6">
                    Notifications enabled (
                    {props.birthday.notificationSettings!.notifyAtBefore.length}
                    )
                  </Heading>
                  <Text>За один день до</Text>
                </Box>
              </HStack>
            </Box>
          </Show>

          <Show when={localProps.showGenerateWish}>
            <Box mt="$4">
              <GenerateBirthdayWishBtn
                onBeforeOpen={onBeforeOpen}
                onAfterClose={onAfterClose}
                birthdayId={localProps.birthday.id}
                size="sm"
                colorScheme="accent"
                variant="subtle"
              >
                {localProps.birthday.buddyName}
              </GenerateBirthdayWishBtn>
            </Box>
          </Show>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default BirthdayInfoBtn;
