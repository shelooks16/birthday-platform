import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  FormErrorMessage,
  VStack,
  Input,
  notificationService
} from '@hope-ui/solid';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-yup';
import { profileService } from '../../lib/user/profile.service';
import TimeZonePicker from '../timezone-picker';
import LanguagePicker from '../LanguagePicker';
import { profileField } from '../../lib/user/profile.validation';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';
import { useI18n } from '../../i18n.context';

const schema = () =>
  yup.object({
    displayName: profileField.displayName().required(),
    timeZone: profileField.timeZone().required(),
    locale: profileField.locale().required()
  });
export type ISchema = yup.InferType<ReturnType<typeof schema>>;

type ProfileFormProps = {
  initialData?: Partial<ISchema>;
  onAfterSubmit?: (data: ISchema) => any;
};

const ProfileForm = (props: ProfileFormProps) => {
  const [profilectx, { setProfile }] = useUserProfileCtx();
  const [i18n, { locale }] = useI18n();
  const { form, errors, data, setFields, isSubmitting } = createForm<ISchema>({
    initialValues: {
      displayName: profilectx.profile?.displayName,
      timeZone: profilectx.profile?.timeZone,
      locale: (profilectx.profile?.locale ?? locale()) as any,
      ...props.initialData
    },
    extend: validator({ schema: schema() as any }),
    onSubmit: async (values) => {
      try {
        await profileService.updateMyProfile(values);

        locale(values.locale);
        setProfile({ ...profilectx.profile!, ...values });

        // wait for locale change
        setTimeout(() => {
          notificationService.show({
            status: 'success',
            title: i18n().t('profile.form.success')
          });
        }, 50);

        await props.onAfterSubmit?.(values);
      } catch (err) {
        notificationService.show({
          status: 'danger',
          title: i18n().t('profile.form.error', { message: err.message })
        });
      }
    }
  });

  return (
    <VStack as="form" ref={form} spacing="$4" alignItems="stretch">
      <FormControl required invalid={!!errors('displayName')}>
        <FormLabel>{i18n().t('profile.form.displayName.label')}</FormLabel>
        <Input
          type="text"
          name="displayName"
          autocomplete="off"
          placeholder={i18n().t('profile.form.displayName.placeholder')}
        />
        <FormErrorMessage>{errors('displayName')?.[0]}</FormErrorMessage>
      </FormControl>

      <FormControl required invalid={!!errors('locale')}>
        <FormLabel for="locale-picker-trigger">
          {i18n().t('profile.form.language.label')}
        </FormLabel>
        <LanguagePicker
          id="locale-picker"
          name="locale-picker"
          value={data().locale}
          onChange={(v) => setFields('locale', v)}
        />
        <FormErrorMessage display="block">
          {errors('locale')?.[0]}
        </FormErrorMessage>
        <FormHelperText>
          {i18n().t('profile.form.language.helperText')}
        </FormHelperText>
      </FormControl>

      <FormControl required invalid={!!errors('timeZone')}>
        <FormLabel for="tz-picker-trigger">
          {i18n().t('profile.form.timeZone.label')}
        </FormLabel>
        <TimeZonePicker
          id="tz-picker"
          name="tz-picker"
          value={data().timeZone}
          onChange={(v) => setFields('timeZone', v)}
        />
        <FormErrorMessage display="block">
          {errors('timeZone')?.[0]}
        </FormErrorMessage>
        <FormHelperText>
          {i18n().t('profile.form.timeZone.helperText')}
        </FormHelperText>
      </FormControl>

      <Button type="submit" width="100%" loading={isSubmitting()}>
        {i18n().t('profile.form.submitBtn')}
      </Button>
    </VStack>
  );
};

export default ProfileForm;
