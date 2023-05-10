import {
  For,
  Show,
  createMemo,
  Component,
  createEffect,
  on,
  ParentComponent
} from 'solid-js';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  SelectLabel,
  SelectOptGroup,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SimpleOption,
  SimpleSelect,
  Stack,
  Textarea,
  VStack
} from '@hope-ui/solid';
import { BirthdayDocument, NotifyBeforePreset } from '@shared/types';
import { groupBy } from '@shared/general-utils';
import { getNotifyBeforePresets } from '@shared/static-cms';
import { parseNotifyBeforePreset } from '@shared/notification';
import TimeZonePicker from '../timezone-picker';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';
import {
  birthdayService,
  NewBirthdayData
} from '../../lib/birthday/birthday.service';
import OptionalTooltip from '../OptionalTooltip';
import { useNotificationChannelsCtx } from '../../lib/notificationChannel/notificationChannels.context';
import EditNotificationChannelsBtn from '../notificationChannel/EditNotificationChannelsBtn';
import { useI18n } from '../../i18n.context';

const maxAllowedAge = 80;
const minAllowedAge = 0;
const yearToday = new Date().getFullYear();
const upYear = yearToday - minAllowedAge;
const downYear = yearToday - maxAllowedAge;
const years = Array(upYear - downYear)
  .fill(null)
  .map((_val, idx) => upYear - idx);

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function listDays(monthIdx: number, year: number) {
  const numOfDays = new Date(year, monthIdx + 1, 0).getDate();

  return Array(numOfDays)
    .fill(null)
    .map((_val, idx) => idx + 1);
}

const schema = yup.object({
  name: yup.string().required().trim().min(3),
  description: yup.string().optional(),
  day: yup.number().min(1).max(31).required(),
  year: yup.number().min(downYear).max(upYear).required(),
  month: yup.number().min(0).max(11).required(),
  setupNotifications: yup.boolean().optional().default(false),
  notifyAtBefore: yup
    .array(yup.string<NotifyBeforePreset>().required())
    .when('setupNotifications', {
      is: true,
      then: (schema) => schema.required().min(1),
      otherwise: (schema) => schema.optional()
    }),
  notifyChannelsIds: yup
    .array(yup.string().required())
    .when('setupNotifications', {
      is: true,
      then: (schema) => schema.required().min(1),
      otherwise: (schema) => schema.optional()
    }),
  timeZone: yup.string().when('setupNotifications', {
    is: true,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.optional()
  })
});
type ISchema = yup.InferType<typeof schema>;

const FormSectionTitle: ParentComponent = (props) => {
  return (
    <Heading textAlign="left" size="xl" color="$neutral11">
      {props.children}
    </Heading>
  );
};

export type BirthdayFormProps = {
  onAfterSubmit?: (
    createdOrUpdatedBirthday: BirthdayDocument,
    formData: ISchema
  ) => any;
  initialData?: Partial<ISchema>;
  /** If passed, edit existing birthday */
  birthdayId?: string;
};

const BirthdayForm: Component<BirthdayFormProps> = (props) => {
  const [profilectx] = useUserProfileCtx();
  const [channelsCtx] = useNotificationChannelsCtx();
  const [i18n] = useI18n();

  const { form, errors, data, setFields, isSubmitting } = createForm<ISchema>({
    extend: validator({ schema: schema as any }),
    initialValues: {
      timeZone: profilectx.profile?.timeZone,
      ...props.initialData
    },
    onSubmit: async (values) => {
      const data: NewBirthdayData = {
        birth: {
          day: values.day,
          month: values.month,
          year: values.year
        },
        buddyName: values.name,
        notificationSettings: values.setupNotifications
          ? {
              timeZone: values.timeZone!,
              notifyChannelsIds: values.notifyChannelsIds!,
              notifyAtBefore: values.notifyAtBefore!
            }
          : null,
        ...(values.description ? { buddyDescription: values.description } : {})
      };

      const createdOrUpdated = props.birthdayId
        ? await birthdayService.updateBirthdayById(props.birthdayId, data)
        : await birthdayService.addNewBirthday(data);

      props.onAfterSubmit?.(createdOrUpdated, values);
    }
  });

  const notifyBeforeOptions = () =>
    getNotifyBeforePresets().map((preset) => {
      const { value: unitValue, humanUnit } = parseNotifyBeforePreset(preset);

      return {
        value: preset,
        label: i18n().t('notification.notifyBeforePresetLabel', {
          value: i18n().format.toPlainTime(unitValue, humanUnit)
        })
      };
    });

  const channelGroups = createMemo(() =>
    !channelsCtx.error && channelsCtx.latest?.length
      ? groupBy(channelsCtx.latest, (channel) => channel.type)
      : {}
  );

  const canPickBirthDay = createMemo(() => !!(data().month + 1 && data().year));

  // ??? set explicit dependency for below createEfect
  const yearMonthChange = createMemo(
    () => (data().month ?? '-') + (data().year ?? '-')
  );

  createEffect(
    on(yearMonthChange, () => {
      if (!data().day) return;

      const daysList = listDays(data().month, data().year);

      if (data().day > daysList.length) {
        setFields('day', daysList.length);
      }
    })
  );

  createEffect(() => {
    if (!channelsCtx.error && channelsCtx.latest?.length === 0) {
      setFields('setupNotifications', false);
    }
  });

  return (
    <VStack as="form" ref={form} spacing="$4" alignItems="stretch">
      <FormSectionTitle>Главная информация</FormSectionTitle>

      <FormControl required invalid={!!errors('name')}>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          name="name"
          autocomplete="off"
          placeholder="E.g. DarkForceDemon"
        />
        <FormErrorMessage>{errors('name')?.[0]}</FormErrorMessage>
      </FormControl>

      <FormControl invalid={!!errors('description')}>
        <FormLabel>Buddy description</FormLabel>
        <Textarea name="description" placeholder="E.g. DarkForceDemon" />
        <FormErrorMessage>{errors('description')?.[0]}</FormErrorMessage>
      </FormControl>

      <Stack spacing="$3" direction={{ '@initial': 'row', '@md': 'row' }}>
        <FormControl minWidth="$px" required invalid={!!errors('year')}>
          <FormLabel for="year-trigger">Year</FormLabel>
          <SimpleSelect
            id="year"
            value={data().year}
            onChange={(value) => setFields('year', value)}
          >
            <For each={years}>
              {(year) => <SimpleOption value={year}>{year}</SimpleOption>}
            </For>
          </SimpleSelect>
          <FormErrorMessage>{errors('year')?.[0]}</FormErrorMessage>
        </FormControl>

        <FormControl minWidth="$px" required invalid={!!errors('month')}>
          <FormLabel for="month-trigger">Month</FormLabel>
          <SimpleSelect
            id="month"
            value={data().month}
            onChange={(value) => setFields('month', value)}
          >
            <For each={months}>
              {(monthLabel, monthIdx) => (
                <SimpleOption value={monthIdx()}>{monthLabel}</SimpleOption>
              )}
            </For>
          </SimpleSelect>
          <FormErrorMessage>{errors('month')?.[0]}</FormErrorMessage>
        </FormControl>

        <FormControl minWidth="$px" required invalid={!!errors('day')}>
          <FormLabel for="day-trigger">Day</FormLabel>
          <OptionalTooltip
            showWhen={!canPickBirthDay()}
            label="Выбери год и месяц"
          >
            <Box>
              <SimpleSelect
                id="day"
                value={data().day}
                onChange={(value) => setFields('day', value)}
                disabled={!canPickBirthDay()}
              >
                <Show when={canPickBirthDay()}>
                  <For each={listDays(data().month, data().year)}>
                    {(day) => <SimpleOption value={day}>{day}</SimpleOption>}
                  </For>
                </Show>
              </SimpleSelect>
            </Box>
          </OptionalTooltip>
          <FormErrorMessage>{errors('day')?.[0]}</FormErrorMessage>
        </FormControl>
      </Stack>

      <Show when={data().day && data().month + 1 && data().year}>
        <b>
          {i18n().format.dateToDayMonthYear(
            new Date(data().year, data().month, data().day)
          )}
        </b>
      </Show>

      <FormSectionTitle>Уведомления</FormSectionTitle>

      <Box>
        <FormHelperText d="block" mb="$2" mt="$0">
          Хочешь всегда помнить о дни рождении и ничего не пропустить? Мы можем
          отправить тебе уведомления чтобы ты не забыл.
        </FormHelperText>
        <EditNotificationChannelsBtn size="xs" variant="dashed">
          Настройки каналов уведомлений
        </EditNotificationChannelsBtn>
      </Box>

      <FormControl invalid={!!errors('setupNotifications')}>
        <OptionalTooltip
          showWhen={!channelsCtx.error && !channelsCtx.latest?.length}
          label="Хотя бы 1 канал связи"
          closeOnClick={false}
        >
          <Box d="inline-block">
            <Checkbox
              id="setup-notifications"
              checked={data().setupNotifications}
              onChange={(ev: any) =>
                setFields('setupNotifications', ev.target.checked)
              }
              disabled={!channelsCtx.error && !channelsCtx.latest?.length}
            >
              Окей, я хочу получать уведомления
            </Checkbox>
          </Box>
        </OptionalTooltip>
        <Box>
          <FormErrorMessage>
            {errors('setupNotifications')?.[0]}
          </FormErrorMessage>
        </Box>
      </FormControl>

      <Show when={data().setupNotifications}>
        <FormControl required invalid={!!errors('notifyAtBefore')}>
          <FormLabel for="notifyAt-trigger">Notify at before</FormLabel>
          <SimpleSelect
            id="notifyAt"
            name="notifyAt"
            value={data().notifyAtBefore}
            onChange={(v) => setFields('notifyAtBefore', v)}
            multiple
          >
            <For each={notifyBeforeOptions()}>
              {(item) => (
                <SimpleOption value={item.value}>{item.label}</SimpleOption>
              )}
            </For>
          </SimpleSelect>
          <FormErrorMessage>{errors('notifyAtBefore')?.[0]}</FormErrorMessage>
        </FormControl>

        <FormControl required invalid={!!errors('notifyChannelsIds')}>
          <FormLabel for="verified-channels-trigger">Notify through</FormLabel>
          <SimpleSelect
            id="verified-channels"
            name="verified-channels"
            value={data().notifyChannelsIds}
            onChange={(v) => setFields('notifyChannelsIds', v)}
            multiple
          >
            <For each={Object.keys(channelGroups())}>
              {(channelType) => (
                <SelectOptGroup>
                  <SelectLabel>
                    {i18n().t(
                      `notificationChannel.labels.${channelType}` as any,
                      {},
                      channelType
                    )}
                  </SelectLabel>
                  <For each={channelGroups()[channelType]}>
                    {(channel) => (
                      <SelectOption value={channel.id}>
                        <SelectOptionText>
                          {channel.displayName}
                        </SelectOptionText>
                        <SelectOptionIndicator />
                      </SelectOption>
                    )}
                  </For>
                </SelectOptGroup>
              )}
            </For>
          </SimpleSelect>
          <FormErrorMessage>
            {errors('notifyChannelsIds')?.[0]}
          </FormErrorMessage>
        </FormControl>

        <FormControl required invalid={!!errors('timeZone')}>
          <FormLabel for="tz-trigger">Timezone</FormLabel>
          <TimeZonePicker
            id="tz"
            name="tz"
            value={data().timeZone}
            onChange={(v) => setFields('timeZone', v)}
          />
          <FormErrorMessage>{errors('timeZone')?.[0]}</FormErrorMessage>
          <FormHelperText>
            So notifications will be delivered to you on time
          </FormHelperText>
        </FormControl>
      </Show>

      <Box mt="$4">
        <Button width="100%" type="submit" loading={isSubmitting()}>
          {props.birthdayId ? 'Сохранить изменения' : 'Добавить днюху'}
        </Button>
      </Box>
    </VStack>
  );
};

export default BirthdayForm;
