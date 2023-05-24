import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  FormErrorMessage,
  VStack
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
    timeZone: profileField.timeZone().required(),
    locale: profileField.locale().required()
  });
export type ISchema = yup.InferType<ReturnType<typeof schema>>;

type ProfileFormProps = {
  initialData?: Partial<ISchema>;
  onAfterSubmit?: (data: ISchema) => any;
};

const ProfileForm = (props: ProfileFormProps) => {
  const [profilectx] = useUserProfileCtx();
  const [, { locale }] = useI18n();
  const { form, errors, data, setFields, isSubmitting } = createForm<ISchema>({
    initialValues: {
      timeZone: profilectx.profile?.timeZone,
      locale: (profilectx.profile?.locale ?? locale()) as any,
      ...props.initialData
    },
    extend: validator({ schema: schema() as any }),
    onSubmit: async (values) => {
      await profileService.updateMyProfile(values);
      locale(values.locale);
      await props.onAfterSubmit?.(values);
    }
  });

  return (
    <VStack as="form" ref={form} spacing="$4" alignItems="stretch">
      <FormControl required invalid={!!errors('locale')}>
        <FormLabel for="locale-picker-trigger">
          Set language preference
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
        <FormHelperText>yo pls?</FormHelperText>
      </FormControl>

      <FormControl required invalid={!!errors('timeZone')}>
        <FormLabel for="tz-picker-trigger">
          Confirm your default timezone
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
          Default timezone for notifications (can be changed at any time)
        </FormHelperText>
      </FormControl>

      <Button type="submit" width="100%" loading={isSubmitting()}>
        Save
      </Button>
    </VStack>
  );
};

export default ProfileForm;
