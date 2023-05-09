import {
  Accessor,
  createContext,
  createMemo,
  ParentComponent,
  useContext
} from 'solid-js';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { appConfig } from '../appConfig';
import { useI18n } from '../i18n.context';

function getVisibleWeeks(year: number, month: number, startFromDayIdx = 0) {
  const startDate = new Date(year, month);
  const prevMonthDaysVisible = startDate.getDay() - startFromDayIdx;
  const endDate = new Date(year, month + 1, 0);
  const nextMonthDaysVisible = 6 - endDate.getDay();
  const dayCount =
    endDate.getDate() + prevMonthDaysVisible + nextMonthDaysVisible;
  startDate.setDate(startDate.getDate() - prevMonthDaysVisible);
  endDate.setDate(endDate.getDate() + nextMonthDaysVisible);

  const weeks: Date[][] = [];

  for (let i = 0; i < dayCount / 7; i++) {
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 7 + j);
      week.push(date);
    }
    weeks.push(week);
  }

  return weeks;
}

type State = {
  visibleMonth: number;
  visibleYear: number;
};

export type ICalendarContext = {
  state: State;
  setState: SetStoreFunction<State>;
  today: Date;
  visibleWeeks: Accessor<Date[][]>;
  monthIndices: number[];
  weekDayIndices: number[];
  selectors: {
    isToday(date: Date): boolean;
    isPastDate(date: Date): boolean;
    isDateInVisibleMonth(date: Date): boolean;
  };
  actions: {
    goToDirection(direction: 'prev' | 'next', unit: 'month' | 'year'): void;
    goToToday(): void;
  };
  formatters: {
    monthIdxToLabel(monthIdx: number): string;
    weekDayIdxToLabel(weekDayIdx: number): string;
  };
};

const CalendarContext = createContext<ICalendarContext>();
export const useCalendarCtx = () => useContext(CalendarContext)!;

export const CalendarProvider: ParentComponent = (props) => {
  const today = new Date();

  const [i18n] = useI18n();

  const [state, setState] = createStore<State>({
    visibleMonth: today.getMonth(),
    visibleYear: today.getFullYear()
  });

  const visibleWeeks = createMemo(() =>
    getVisibleWeeks(
      state.visibleYear,
      state.visibleMonth,
      appConfig.calendar.startWeekFromDayIdx
    )
  );

  const monthIndices = Array(12)
    .fill(null)
    .map((_, idx) => idx);

  const weekDayIndices = Array(7)
    .fill(null)
    .map((_, idx) => appConfig.calendar.startWeekFromDayIdx + idx);

  const selectors = {
    isToday(date: Date) {
      return date.toDateString() === new Date().toDateString();
    },
    isPastDate(date: Date) {
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      return target.getTime() < now.getTime();
    },
    isDateInVisibleMonth(date: Date) {
      return date.getMonth() === state.visibleMonth;
    }
  };

  const actions = {
    goToDirection(direction: 'prev' | 'next', unit: 'month' | 'year') {
      const addition = direction === 'next' ? 1 : -1;
      const newDate = new Date(state.visibleYear, state.visibleMonth);

      if (unit === 'month') {
        newDate.setMonth(state.visibleMonth + addition);
      } else if (unit === 'year') {
        newDate.setFullYear(state.visibleYear + addition);
      }

      setState({
        visibleMonth: newDate.getMonth(),
        visibleYear: newDate.getFullYear()
      });
    },
    goToToday() {
      const today = new Date();

      setState({
        visibleMonth: today.getMonth(),
        visibleYear: today.getFullYear()
      });
    }
  };

  const formatters = {
    monthIdxToLabel(monthIdx: number) {
      const date = new Date(today);
      date.setDate(1);
      date.setMonth(monthIdx);

      return i18n().format.dateToMonth(date);
    },
    weekDayIdxToLabel(weekDayIdx: number) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + weekDayIdx);

      return i18n().format.dateToWeekDay(date);
    }
  };

  const context: ICalendarContext = {
    state,
    setState,
    today,
    visibleWeeks,
    weekDayIndices,
    monthIndices,
    selectors,
    actions,
    formatters
  };

  return (
    <CalendarContext.Provider value={context}>
      {props.children}
    </CalendarContext.Provider>
  );
};
