import { Box, SimpleGrid } from '@hope-ui/solid';
import { BirthdayDocumentWithDate, splitBirthdays } from '@shared/birthday';
import { BirthdayDocument } from '@shared/types';
import { Component, createMemo, For, Show } from 'solid-js';
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
        mb="$10"
        py="$4"
        as="fieldset"
        css={
          props.isToday ? borderSpinCss() : { borderTop: '1px solid $neutral6' }
        }
      >
        <Box
          as="legend"
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
          <For each={props.list}>
            {(b) => (
              <Box p="$2">
                <BirthdayListItem birthday={b} isToday={props.isToday} />
              </Box>
            )}
          </For>
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
        title={i18n().format.dateToDaysDiff(new Date()).phrase}
        isToday
      />
      <BirthdaySublistGrid list={list().upcomingList} title="Upcoming" />
      <BirthdaySublistGrid list={list().pastList} title="Past birthdays" />
    </Box>
  );
};

export default BirthdayList;
