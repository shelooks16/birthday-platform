import { Box, SimpleGrid } from '@hope-ui/solid';
import { BirthdayDocumentWithDate, splitBirthdays } from '@shared/birthday';
import { BirthdayDocument } from '@shared/types';
import { Component, createMemo, Index, Show } from 'solid-js';
import { useI18n } from '../../../i18n.context';
import { borderSpinCss, fadeInCss } from '../../../lib/stitches.utils';
import BirthdayListItem from './BirthdayListItem';

type BirthdaySublistGridProps = {
  title: string;
  list: BirthdayDocumentWithDate[];
  isToday?: boolean;
};

const BirthdaySublistGrid: Component<BirthdaySublistGridProps> = (props) => {
  return (
    <Show when={props.list.length > 0}>
      <Box
        mb="$14"
        py="$6"
        position="relative"
        css={
          props.isToday ? borderSpinCss() : { borderTop: '1px solid $neutral6' }
        }
      >
        <Box
          position="absolute"
          top={0}
          left="50%"
          css={{ transform: 'translate(-50%, -50%)' }}
          mx="auto"
          px="$2"
          borderRadius="$md"
          fontSize="$sm"
          fontWeight="$semibold"
          bg={props.isToday ? '$accent2' : '$neutral2'}
          color={props.isToday ? '$accent10' : '$neutral11'}
        >
          {props.title}
        </Box>
        <SimpleGrid
          columns={{ '@initial': 1, '@sm': 3 }}
          gap="$8"
          css={fadeInCss()}
        >
          <Index each={props.list}>
            {(b) => (
              <Box p="$2">
                <BirthdayListItem birthday={b()} isToday={props.isToday} />
              </Box>
            )}
          </Index>
        </SimpleGrid>
      </Box>
    </Show>
  );
};

type BirthdayListProps = {
  birthdays: BirthdayDocument[];
};

const BirthdayList: Component<BirthdayListProps> = (props) => {
  const list = createMemo(() => splitBirthdays(props.birthdays));
  const [i18n] = useI18n();

  return (
    <Box>
      <BirthdaySublistGrid
        list={list().todayList}
        title={i18n().t('birthday.list.todayTitle')}
        isToday
      />
      <BirthdaySublistGrid
        list={list().upcomingList}
        title={i18n().t('birthday.list.futureTitle')}
      />
      <BirthdaySublistGrid
        list={list().pastList}
        title={i18n().t('birthday.list.pastTitle')}
      />
    </Box>
  );
};

export default BirthdayList;
