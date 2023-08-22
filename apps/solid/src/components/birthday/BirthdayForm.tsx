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
  notificationService,
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
import { BirthdayDocument } from '@shared/types';
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
import { birthdayField } from '../../lib/birthday/birthday.validation';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';

function listDays(monthIdx: number, year: number) {
  const numOfDays = new Date(year, monthIdx + 1, 0).getDate();

  return Array(numOfDays)
    .fill(null)
    .map((_val, idx) => idx + 1);
}

const schema = () =>
  yup.object({
    name: birthdayField.buddyName().required(),
    description: birthdayField.buddyDescription().optional(),
    day: birthdayField.birth.day().required(),
    year: birthdayField.birth.year().required(),
    month: birthdayField.birth.month().required(),
    setupNotifications: yup.boolean().optional().default(false),
    notifyAtBefore: birthdayField.notificationSettings
      .notifyAtBefore()
      .when('setupNotifications', {
        is: true,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.optional()
      }),
    notifyChannelsIds: birthdayField.notificationSettings
      .notifyChannelsIds()
      .when('setupNotifications', {
        is: true,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.optional()
      }),
    timeZone: birthdayField.notificationSettings
      .timeZone()
      .when('setupNotifications', {
        is: true,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.optional()
      })
  });
type ISchema = yup.InferType<ReturnType<typeof schema>>;

const FormSectionTitle: ParentComponent = (props) => {
  return (
    <Heading textAlign="left" size="xl" color="$neutral11">
      {props.children}
    </Heading>
  );
};

export type BirthdayFormProps = {
  onAfterSubmit?: (createdOrUpdatedBirthday: BirthdayDocument) => any;
  initialData?: Partial<ISchema>;
  /** If passed, edit existing birthday */
  birthdayId?: string;
};

const BirthdayForm: Component<BirthdayFormProps> = (props) => {
  const [, { mutate: mutateBirthdays }] = useBirthdaysCtx();
  const [profilectx] = useUserProfileCtx();
  const [channelsCtx] = useNotificationChannelsCtx();
  const [i18n] = useI18n();

  const { form, errors, data, setFields, isSubmitting } = createForm<ISchema>({
    extend: validator({ schema: schema() as any }),
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

      try {
        const createdOrUpdated = props.birthdayId
          ? await birthdayService.updateBirthday(props.birthdayId, data)
          : await birthdayService.addBirthday(data);

        if (props.birthdayId) {
          mutateBirthdays((list) =>
            list
              ? list.map((item) =>
                  item.id === createdOrUpdated.id ? createdOrUpdated : item
                )
              : list
          );
        } else {
          mutateBirthdays((val) => (val ? val.concat(createdOrUpdated) : val));
        }

        props.onAfterSubmit?.(createdOrUpdated);
      } catch (err) {
        notificationService.show({
          status: 'danger',
          title: i18n().t('birthday.addBirthday.error', {
            message: err.message
          })
        });
      }
    }
  });

  const notifyBeforeOptions = () =>
    getNotifyBeforePresets().map((preset) => {
      const { value: unitValue, humanUnit } = parseNotifyBeforePreset(preset);

      return {
        value: preset,
        label: i18n().t('common.notification.notifyBeforePresetLabel', {
          value: i18n().format.toPlainTime(unitValue, humanUnit)
        })
      };
    });

  const yearOptions = () => {
    const maxYear = new Date().getFullYear();
    const minYear = 1920;

    return Array(maxYear - minYear + 1)
      .fill(null)
      .map((_val, idx) => ({
        value: maxYear - idx,
        label: maxYear - idx
      }));
  };

  const monthOptions = () => {
    return Array(12)
      .fill(null)
      .map((_val, idx) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(idx);

        return {
          value: idx,
          label: i18n().format.dateToMonth(date)
        };
      });
  };

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
      <FormSectionTitle>
        {i18n().t('birthday.form.mainInfo.title')}
      </FormSectionTitle>

      <FormControl required invalid={!!errors('name')}>
        <FormLabel>{i18n().t('birthday.form.mainInfo.name.label')}</FormLabel>
        <Input
          type="text"
          name="name"
          autocomplete="off"
          placeholder={i18n().t('birthday.form.mainInfo.name.placeholder')}
        />
        <FormErrorMessage>{errors('name')?.[0]}</FormErrorMessage>
      </FormControl>

      <FormControl invalid={!!errors('description')}>
        <FormLabel>
          {i18n().t('birthday.form.mainInfo.buddyDescription.label')}
        </FormLabel>
        <Textarea
          name="description"
          placeholder={i18n().t(
            'birthday.form.mainInfo.buddyDescription.placeholder'
          )}
        />
        <FormErrorMessage>{errors('description')?.[0]}</FormErrorMessage>
      </FormControl>

      <Stack spacing="$3" direction={{ '@initial': 'row', '@md': 'row' }}>
        <FormControl minWidth="$px" required invalid={!!errors('year')}>
          <FormLabel for="year-trigger">
            {i18n().t('birthday.form.mainInfo.dob.year.label')}
          </FormLabel>
          <SimpleSelect
            id="year"
            value={data().year}
            onChange={(value) => setFields('year', value)}
          >
            <For each={yearOptions()}>
              {(option) => (
                <SimpleOption value={option.value}>{option.label}</SimpleOption>
              )}
            </For>
          </SimpleSelect>
          <FormErrorMessage>{errors('year')?.[0]}</FormErrorMessage>
        </FormControl>

        <FormControl minWidth="$px" required invalid={!!errors('month')}>
          <FormLabel for="month-trigger">
            {i18n().t('birthday.form.mainInfo.dob.month.label')}
          </FormLabel>
          <SimpleSelect
            id="month"
            value={data().month}
            onChange={(value) => setFields('month', value)}
          >
            <For each={monthOptions()}>
              {(option) => (
                <SimpleOption value={option.value}>{option.label}</SimpleOption>
              )}
            </For>
          </SimpleSelect>
          <FormErrorMessage>{errors('month')?.[0]}</FormErrorMessage>
        </FormControl>

        <FormControl minWidth="$px" required invalid={!!errors('day')}>
          <FormLabel for="day-trigger">
            {i18n().t('birthday.form.mainInfo.dob.day.label')}
          </FormLabel>
          <OptionalTooltip
            showWhen={!canPickBirthDay()}
            label={i18n().t('birthday.form.mainInfo.dob.day.unavailable')}
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
        {i18n().t('birthday.form.mainInfo.dob.selectedLabel', {
          dob: i18n().format.dateToDayMonthYear(
            new Date(data().year, data().month, data().day)
          )
        })}
      </Show>

      <FormSectionTitle>
        {i18n().t('birthday.form.notifications.title')}
      </FormSectionTitle>

      <Box>
        <FormHelperText d="block" mb="$2" mt="$0">
          {i18n().t('birthday.form.notifications.description')}
        </FormHelperText>
        <EditNotificationChannelsBtn size="xs" variant="dashed" />
      </Box>

      <FormControl invalid={!!errors('setupNotifications')}>
        <OptionalTooltip
          showWhen={!channelsCtx.error && !channelsCtx.latest?.length}
          label={i18n().t(
            'birthday.form.notifications.setupCheckbox.unavailable'
          )}
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
              {i18n().t('birthday.form.notifications.setupCheckbox.label')}
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
          <FormLabel for="notifyAt-trigger">
            {i18n().t('birthday.form.notifications.notifyAtBefore.label')}
          </FormLabel>
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
          <FormLabel for="verified-channels-trigger">
            {i18n().t('birthday.form.notifications.channelIds.label')}
          </FormLabel>
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
                      `common.notificationChannel.labels.${channelType}` as any,
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
          <FormLabel for="tz-trigger">
            {i18n().t('birthday.form.notifications.timezone.label')}
          </FormLabel>
          <TimeZonePicker
            id="tz"
            name="tz"
            value={data().timeZone}
            onChange={(v) => setFields('timeZone', v)}
          />
          <FormErrorMessage>{errors('timeZone')?.[0]}</FormErrorMessage>
          <FormHelperText>
            {i18n().t('birthday.form.notifications.timezone.helperText')}
          </FormHelperText>
        </FormControl>
      </Show>

      <Box mt="$4">
        <Button width="100%" type="submit" loading={isSubmitting()}>
          {props.birthdayId
            ? i18n().t('birthday.form.submitBtn.update')
            : i18n().t('birthday.form.submitBtn.addNew')}
        </Button>
      </Box>
    </VStack>
  );
};

export default BirthdayForm;
