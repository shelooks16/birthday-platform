import { Button, VStack } from '@hope-ui/solid';
import { Component, Index, createSignal, Show } from 'solid-js';
import { BirthdayDocument } from '@shared/types';
import { IconBell } from '../../Icons';
import BirthdayInfoBtn from './BirthdayInfoBtn';
import { appConfig } from '../../../appConfig';
import { useI18n } from '../../../i18n.context';

type BirthdayInfoBtnListProps = {
  birthdays: BirthdayDocument[];
  currentYear: number;
  showGenerateWish: boolean;
  isInPast: boolean;
};

const BirthdayInfoBtnList: Component<BirthdayInfoBtnListProps> = (props) => {
  const [i18n] = useI18n();
  const [showMore, setShowMore] = createSignal(false);

  const isShowMoreVisible = () =>
    props.birthdays.length > appConfig.calendar.numOfVisibleItemsPerDayCell;

  const visibleItems = () => {
    return showMore()
      ? props.birthdays
      : props.birthdays.slice(
          0,
          appConfig.calendar.numOfVisibleItemsPerDayCell
        );
  };

  return (
    <>
      <VStack alignItems="stretch" spacing="$2">
        <Index each={visibleItems()}>
          {(item) => (
            <BirthdayInfoBtn
              birthday={item()}
              currentYear={props.currentYear}
              showGenerateWish={props.showGenerateWish}
              isPastBirthday={props.isInPast}
              variant="solid"
              size="xs"
              px="$1"
              colorScheme={props.isInPast ? 'neutral' : 'accent'}
              css={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mx: 0,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
              rightIcon={
                item().notificationSettings?.notifyAtBefore?.length ? (
                  <IconBell boxSize={11} />
                ) : undefined
              }
            />
          )}
        </Index>
      </VStack>
      <Show when={isShowMoreVisible()}>
        <Button
          size="xs"
          w="100%"
          mt="$2"
          onClick={() => setShowMore((p) => !p)}
          variant="ghost"
          colorScheme="neutral"
        >
          {showMore()
            ? i18n().t('birthday.calendar.dayCell.showLess')
            : i18n().t('birthday.calendar.dayCell.showMore', {
                amount: props.birthdays.length - visibleItems().length
              })}
        </Button>
      </Show>
    </>
  );
};

export default BirthdayInfoBtnList;
