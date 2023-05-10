import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  HTMLHopeProps,
  Select,
  SelectContent,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectTrigger,
  SelectValue,
  Stack,
  SystemStyleObject
} from '@hope-ui/solid';
import { BirthdayDocument } from '@shared/types';
import {
  Component,
  createEffect,
  createSignal,
  For,
  on,
  ParentComponent,
  Show
} from 'solid-js';
import { borderSpinCss, fadeInCss } from '../../../lib/stitches.utils';
import {
  CalendarProvider,
  useCalendarCtx
} from '../../../lib/calendar.context';
import { IconChevronLeft, IconChevronRight } from '../../Icons';
import MobileInfoBtn from './MobileInfoBtn';
import { useI18n } from '../../../i18n.context';
import BirthdayInfoBtnList from './BirthdayInfoBtnList';

const dayWithBirthday = {
  future: {
    color: '$accent10',
    background:
      'repeating-linear-gradient( 45deg, $accent4 0px, $accent4 5px, transparent 5px, transparent 10px )',
    border: '1px solid $accent6'
  },
  past: {
    color: '$neutral10',
    background:
      'repeating-linear-gradient( 45deg, $neutral4 0px, $neutral4 5px, transparent 5px, transparent 10px )',
    border: '1px solid $neutral6'
  }
};

const DaysLeftText: Component<{ date: Date } & HTMLHopeProps<'div'>> = (
  props
) => {
  const [i18n] = useI18n();

  return (
    <Box {...props}>{i18n().format.dateToDaysDiff(props.date).phrase}</Box>
  );
};

const Navigation: Component = () => {
  const { actions, state, setState, monthIndices, formatters, today } =
    useCalendarCtx();

  return (
    <Stack
      spacing="$2"
      justifyContent="space-between"
      flexDirection={{ '@initial': 'column', '@sm': 'row' }}
    >
      <Button
        variant="outline"
        colorScheme="neutral"
        onClick={actions.goToToday}
      >
        <DaysLeftText date={today} />
      </Button>

      <ButtonGroup attached>
        <Button
          type="button"
          colorScheme="neutral"
          variant="outline"
          onClick={() => actions.goToDirection('prev', 'month')}
          mr="-1px"
        >
          <IconChevronLeft />
        </Button>
        <Select
          value={state.visibleMonth}
          onChange={(v) => setState('visibleMonth', +v)}
        >
          <SelectTrigger
            as={Button}
            variant="outline"
            colorScheme="neutral"
            minWidth="140px"
          >
            <SelectValue textAlign="center">
              {formatters.monthIdxToLabel(state.visibleMonth)}{' '}
              {state.visibleYear}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectListbox>
              <For each={monthIndices}>
                {(month) => (
                  <SelectOption value={month} d="flex">
                    <SelectOptionText>
                      {formatters.monthIdxToLabel(month)}
                    </SelectOptionText>
                    <SelectOptionIndicator color="$accent10" />
                  </SelectOption>
                )}
              </For>
            </SelectListbox>
          </SelectContent>
        </Select>
        <Button
          type="button"
          colorScheme="neutral"
          variant="outline"
          ml="-1px"
          onClick={() => actions.goToDirection('next', 'month')}
        >
          <IconChevronRight />
        </Button>
      </ButtonGroup>
    </Stack>
  );
};

const WeeksHeader: Component = () => {
  const { weekDayIndices, formatters } = useCalendarCtx();

  return (
    <thead>
      <Box
        as="tr"
        css={{
          height: '40px',
          padding: 0,
          textAlign: 'center',
          verticalAlign: 'middle'
        }}
      >
        <For each={weekDayIndices}>
          {(item) => {
            const label = formatters.weekDayIdxToLabel(item);

            return (
              <Box
                as="th"
                scope="col"
                title={label}
                css={{
                  cursor: 'help',
                  fontWeight: '$normal',
                  color: '#8b9898',
                  fontSize: '$sm',
                  padding: '10px'
                }}
              >
                {label}
              </Box>
            );
          }}
        </For>
      </Box>
    </thead>
  );
};

type DayCellProps = {
  date: Date;
  birthdays: BirthdayDocument[];
};

const DayCell: Component<DayCellProps> = (props) => {
  const { selectors, state } = useCalendarCtx();

  const isToday = () => selectors.isToday(props.date);
  const isPast = () => selectors.isPastDate(props.date);
  const isDateInVisibleMonth = () => selectors.isDateInVisibleMonth(props.date);

  const tdCss = (): SystemStyleObject => {
    const opacity: SystemStyleObject['opacity'] = isDateInVisibleMonth()
      ? 1
      : 0.3;

    const backgroundDesktop: SystemStyleObject['background'] = 'none';

    let backgroundMobile: SystemStyleObject['background'] = 'none';
    if (props.birthdays.length > 0 && !isToday()) {
      backgroundMobile = isPast()
        ? dayWithBirthday.past.background
        : dayWithBirthday.future.background;
    }

    return {
      opacity,
      // animation: `${keyframes({
      //   '0%': { opacity: 0 },
      //   '100%': { opacity: isDateInVisibleMonth() ? 1 : 0.3 }
      // })} 0.2s ease-in forwards`,
      background: backgroundMobile,
      position: 'relative',
      width: '50px',
      height: '50px',
      minWidth: '50px',
      minHeight: '50px',
      maxWidth: '50px',
      maxHeight: '50px',
      border: '1px solid $neutral6',
      fontWeight: isToday() ? '$semibold' : '$normal',
      '@md': {
        background: backgroundDesktop,
        width: '80px',
        height: '80px',
        minWidth: '80px',
        minHeight: '80px',
        maxWidth: '80px',
        maxHeight: '80px'
      }
    };
  };

  const tdInnerCss = (): SystemStyleObject => {
    const animated: SystemStyleObject =
      isToday() && props.birthdays.length > 0 ? borderSpinCss() : {};

    return {
      ...animated,
      py: '$2',
      px: '$1',
      height: '100%'
    };
  };

  return (
    <Box as="td" css={tdCss()}>
      <Box css={tdInnerCss()}>
        <Show when={props.birthdays.length > 0}>
          <MobileInfoBtn
            birthdays={props.birthdays}
            targetDate={props.date}
            showGenerateWish={isToday()}
            display={{ '@initial': 'block', '@md': 'none' }}
            position="absolute"
            zIndex="$docked"
            top="0px"
            left="0px"
            right="0px"
            bottom="0px"
            width="100%"
            height="100%"
            opacity={0}
          />
        </Show>

        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          position="relative"
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexGrow={{ '@initial': 1, '@md': 0 }}
            fontSize={{ '@initial': '$xs', '@md': '$lg' }}
          >
            <Box
              fontWeight="$medium"
              color={isToday() ? '$accent10' : '$neutral12'}
            >
              {props.date.getDate()}
            </Box>
          </Box>

          {isToday() && (
            <DaysLeftText
              date={props.date}
              css={{
                position: 'absolute',
                right: '50%',
                top: '-6px',
                transform: 'translateX(50%)',
                fontSize: '9px',
                color: '$accent10',
                textAlign: 'center',
                fontWeight: '$bold',
                '@md': {
                  mt: '$3',
                  position: 'static',
                  transform: 'translateX(0%)',
                  fontSize: '$xs'
                }
              }}
            />
          )}

          <Show when={props.birthdays.length > 0}>
            <Box
              flexGrow={1}
              mt="$3"
              display={{ '@initial': 'none', '@md': 'block' }}
            >
              <BirthdayInfoBtnList
                birthdays={props.birthdays}
                currentYear={state.visibleYear}
                showGenerateWish={isToday()}
                isInPast={isPast()}
              />
            </Box>

            <HStack
              fontSize="$xs"
              position="absolute"
              right="50%"
              bottom="-3px"
              transform="translateX(50%)"
              spacing="$1"
              display={{ '@initial': 'flex', '@md': 'none' }}
            >
              <For each={props.birthdays}>
                {() => (
                  <Box
                    width="5px"
                    height="5px"
                    backgroundColor={
                      isPast()
                        ? dayWithBirthday.past.color
                        : dayWithBirthday.future.color
                    }
                    borderRadius="$full"
                  />
                )}
              </For>
            </HStack>
          </Show>
        </Box>
      </Box>
    </Box>
  );
};

type BodyProps = {
  birthdays: BirthdayDocument[];
};

const Body: Component<BodyProps> = (props) => {
  const { visibleWeeks, state } = useCalendarCtx();

  const [animate, setAnimate] = createSignal(false);
  const onAnimationEnd = () => setAnimate(false);

  createEffect(
    on(
      () => state.visibleMonth,
      () => setAnimate(true)
    )
  );

  return (
    <Box
      as="tbody"
      css={animate() ? fadeInCss() : undefined}
      onAnimationEnd={onAnimationEnd}
    >
      <For each={visibleWeeks()}>
        {(weekDates) => (
          <tr>
            <For each={weekDates}>
              {(date) => (
                <DayCell
                  date={date}
                  birthdays={props.birthdays.filter(
                    (b) =>
                      b.birth.day === date.getDate() &&
                      b.birth.month === date.getMonth() &&
                      state.visibleYear - b.birth.year >= 0
                  )}
                />
              )}
            </For>
          </tr>
        )}
      </For>
    </Box>
  );
};

const Table: ParentComponent = (props) => {
  return (
    <Box
      as="table"
      role="grid"
      css={{
        borderCollapse: 'collapse',
        width: '100%',
        tableLayout: 'fixed'
      }}
    >
      {props.children}
    </Box>
  );
};

const Legend = () => {
  const legendItems = [
    {
      background: dayWithBirthday.future.background,
      border: dayWithBirthday.future.border,
      label: 'Clickable day with future birthdays',
      onMobile: true,
      onDesktop: false
    },
    {
      background: dayWithBirthday.past.background,
      border: dayWithBirthday.past.border,
      label: 'Clickable day with past birthdays',
      onMobile: true,
      onDesktop: false
    },
    {
      background: dayWithBirthday.past.color,
      border: 'none',
      label: 'Clickable past birthdays',
      size: 20,
      borderRadius: '$sm',
      onMobile: false,
      onDesktop: true
    },
    {
      background: dayWithBirthday.future.color,
      border: 'none',
      label: 'Clickable upcoming birthdays',
      size: 20,
      borderRadius: '$sm',
      onMobile: false,
      onDesktop: true
    }
  ];

  return (
    <Box>
      <Stack
        spacing="$4"
        css={{
          flexDirection: 'column',
          '@md': {
            flexDirection: 'row',
            justifyContent: 'space-evenly'
          }
        }}
      >
        <For each={legendItems}>
          {(item) => (
            <HStack
              spacing="$3"
              display={{
                '@initial': item.onMobile ? 'flex' : 'none',
                '@md': item.onDesktop ? 'flex' : 'none'
              }}
            >
              <Box
                width={item.size ?? 25}
                height={item.size ?? 25}
                background={item.background}
                border={item.border}
                borderRadius={item.borderRadius}
              />
              <Box fontSize="$sm">{item.label}</Box>
            </HStack>
          )}
        </For>
      </Stack>
    </Box>
  );
};

type BirthdayCalendarProps = { birthdays: BirthdayDocument[] };

const BirthdayCalendar: Component<BirthdayCalendarProps> = (props) => {
  return (
    <Box>
      <CalendarProvider>
        <Box mb="$8">
          <Navigation />
        </Box>

        <Table>
          <WeeksHeader />
          <Body birthdays={props.birthdays} />
        </Table>

        <Box mt="$8">
          <Legend />
        </Box>
      </CalendarProvider>
    </Box>
  );
};

export default BirthdayCalendar;
