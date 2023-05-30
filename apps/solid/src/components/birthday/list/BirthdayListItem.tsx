import { Box, Heading, HStack, Text } from '@hope-ui/solid';
import { BirthdayDocumentWithDate } from '@shared/birthday';
import { Component, createMemo, Show } from 'solid-js';
import { useI18n } from '../../../i18n.context';
import { IconBell } from '../../Icons';
import BirthdayNotificationsTooltip from '../BirthdayNotificationTooltip';
import EditBirthdayBtn from '../EditBirthdayBtn';
import GenerateBirthdayWishBtn from '../GenerateBirthdayWishBtn';

type BirthdayListItemProps = {
  birthday: BirthdayDocumentWithDate;
  isToday?: boolean;
};

const BirthdayListItem: Component<BirthdayListItemProps> = (props) => {
  const [i18n] = useI18n();

  const formatted = createMemo(() => {
    return {
      birthDate: i18n().format.dateToDayMonth(props.birthday.asDateActiveYear),
      zodiacSign: i18n().format.dateToZodiacSign(
        props.birthday.asDateActiveYear
      ),
      daysLeft: i18n().format.dateToDaysDiff(props.birthday.asDateActiveYear),
      age: i18n().format.toPlainTime(
        props.birthday.asDateActiveYear.getFullYear() -
          props.birthday.birth.year,
        'year'
      )
    };
  });

  const isSoon = () =>
    formatted().daysLeft.days > 0 && formatted().daysLeft.days <= 7;

  return (
    <Box
      maxW="100%"
      textAlign="center"
      position="relative"
      _hover={{
        '[data-id="edit"]': {
          display: 'block'
        }
      }}
    >
      <HStack justifyContent="center" gap="$2">
        <Heading
          fontWeight="$semibold"
          as="h2"
          size="xl"
          position="relative"
          d={'inline-block'}
        >
          {props.birthday.buddyName}
          <Box
            d="flex"
            position="absolute"
            right="-5px"
            top="50%"
            transform="translate(100%, -50%)"
          >
            <EditBirthdayBtn birthday={props.birthday} />
          </Box>
        </Heading>
      </HStack>

      <Show when={formatted().daysLeft.days}>
        <BirthdayNotificationsTooltip
          notificationSettings={props.birthday.notificationSettings}
        >
          <Box
            color={isSoon() ? '$accent10' : '$neutral10'}
            fontWeight="$medium"
            mt="$1"
            d="inline-block"
          >
            {formatted().daysLeft.phrase}
            <Show
              when={props.birthday.notificationSettings?.notifyAtBefore?.length}
            >
              <IconBell ml="$1" fontSize="$xs" />
            </Show>
          </Box>
        </BirthdayNotificationsTooltip>
      </Show>

      <Box mt="$1">
        <HStack
          spacing="$2"
          color="$neutral10"
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center"
        >
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
          <Show when={props.birthday.notificationSettings && props.isToday}>
            <BirthdayNotificationsTooltip
              notificationSettings={props.birthday.notificationSettings}
            >
              <Box>
                <Show
                  when={
                    props.birthday.notificationSettings?.notifyAtBefore?.length
                  }
                >
                  <IconBell fontSize="$sm" />
                </Show>
              </Box>
            </BirthdayNotificationsTooltip>
          </Show>
        </HStack>

        <Box
          fontWeight="$bold"
          letterSpacing="$wide"
          fontSize="$xs"
          textTransform="uppercase"
          color="$neutral10"
        >
          {formatted().birthDate}
        </Box>
      </Box>

      <Show when={props.birthday.buddyDescription}>
        <Text size="sm" mt="$2">
          {props.birthday.buddyDescription}
        </Text>
      </Show>

      <Show when={props.isToday}>
        <GenerateBirthdayWishBtn
          birthday={props.birthday}
          colorScheme="accent"
          variant="subtle"
          size="sm"
          mt="$3"
        />
      </Show>
    </Box>
  );
};

export default BirthdayListItem;
