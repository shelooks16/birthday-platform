import { Show, createSignal, Component, onMount } from 'solid-js';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input
} from '@hope-ui/solid';
import { createLocalStorage } from '@solid-primitives/storage';
import {
  ConfirmEmailOtpResult,
  SendEmailVerificationResult
} from '@shared/types';
import { createForm } from '@felte/solid';
import { getTimestamp } from '@shared/firestore-utils';
import { notificationChannelService } from '../../../lib/notificationChannel/notificationChannel.service';
import { useNotificationChannelsCtx } from '../../../lib/notificationChannel/notificationChannels.context';
import { fadeInCss } from '../../../lib/stitches.utils';
import { IconArrowLeft } from '../../Icons';
import { useI18n } from '../../../i18n.context';
import ErrorMessage from '../../error/ErrorMessage';

type AddEmailFormProps = {
  onAfterSubmit?: (data: ConfirmEmailOtpResult) => any;
};

const AddEmailForm: Component<AddEmailFormProps> = (props) => {
  const [i18n] = useI18n();
  const [, { mutate }] = useNotificationChannelsCtx();

  const [verificationInfo, setVerificationInfo] =
    createSignal<SendEmailVerificationResult | null>(null);

  const [sendVerificationError, setSendVerificationError] =
    createSignal<Error | null>(null);
  const [submitError, setSubmitError] = createSignal<Error | null>(null);

  const [lastVerification, setLastVerification, lastVerificationAction] =
    createLocalStorage({
      deserializer: (v) => JSON.parse(v),
      serializer: (v: SendEmailVerificationResult) => JSON.stringify(v),
      prefix: 'lastEmailVerification'
    });

  onMount(() => {
    const latest = lastVerification.result;

    if (latest && getTimestamp() < latest.expiresAt) {
      setVerificationInfo(latest);
    } else {
      lastVerificationAction.remove('result');
    }
  });

  const emailForm = createForm({
    initialValues: {
      email: ''
    },
    onSubmit: async (values) => {
      setSendVerificationError(null);

      try {
        const result = await notificationChannelService.sendEmailVerification({
          email: values.email
        });
        setVerificationInfo(result);
        setLastVerification('result', result);
      } catch (err) {
        setSendVerificationError(err);
      }
    }
  });

  const otpForm = createForm({
    initialValues: {
      otp: ''
    },
    onSubmit: async (values) => {
      setSubmitError(null);

      try {
        const result = await notificationChannelService.confirmEmailOtp({
          email: verificationInfo()!.email,
          otpGuess: values.otp
        });
        lastVerificationAction.remove('result');

        mutate((p) => (p ? p.concat(result.channel) : p));

        props.onAfterSubmit?.(result);
      } catch (err) {
        setSubmitError(err);
      }
    }
  });

  const handleCancelEmail = () => {
    setVerificationInfo(null);
    lastVerificationAction.remove('result');
  };

  return (
    <Box>
      <Show
        when={verificationInfo()}
        fallback={
          <Box>
            <form ref={emailForm.form}>
              <FormControl required invalid={!!emailForm.errors('email')}>
                <FormLabel for="email">
                  {i18n().t(
                    'notificationChannel.email.addNew.sendVerificationForm.email.label'
                  )}
                </FormLabel>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autocomplete="off"
                  placeholder={i18n().t(
                    'notificationChannel.email.addNew.sendVerificationForm.email.placeholder'
                  )}
                />
                <FormErrorMessage>
                  {emailForm.errors('email')?.[0]}
                </FormErrorMessage>
              </FormControl>
              <Show when={sendVerificationError()}>
                <ErrorMessage mt="$2">
                  {sendVerificationError()?.message}
                </ErrorMessage>
              </Show>
              <Button
                type="submit"
                width="100%"
                mt="$2"
                loading={emailForm.isSubmitting()}
              >
                {i18n().t(
                  'notificationChannel.email.addNew.sendVerificationForm.submitBtn'
                )}
              </Button>
            </form>
          </Box>
        }
      >
        <Button
          onClick={handleCancelEmail}
          leftIcon={<IconArrowLeft fontSize="$lg" />}
          size="sm"
          variant="outline"
          colorScheme="neutral"
          mb="$4"
        >
          {i18n().t('notificationChannel.email.addNew.otpForm.goBack')}
        </Button>
        <Box css={fadeInCss()}>
          <form ref={otpForm.form}>
            <FormControl invalid={!!otpForm.errors('otp')}>
              <FormLabel for="otp">
                {i18n().t(
                  'notificationChannel.email.addNew.otpForm.otp.label',
                  { email: verificationInfo()?.email }
                )}
              </FormLabel>
              <Input
                type="text"
                placeholder={i18n().t(
                  'notificationChannel.email.addNew.otpForm.otp.placeholder'
                )}
                id="otp"
                name="otp"
                autocomplete="off"
              />
              <FormErrorMessage>{otpForm.errors('otp')?.[0]}</FormErrorMessage>
              <FormHelperText>
                {i18n().t(
                  'notificationChannel.email.addNew.otpForm.otp.helperText',
                  {
                    expiresAt: i18n().format.dateToDayMonthTime(
                      new Date(verificationInfo()!.expiresAt)
                    )
                  }
                )}
              </FormHelperText>
            </FormControl>
            <Show when={submitError()}>
              <ErrorMessage mt="$2">{submitError()?.message}</ErrorMessage>
            </Show>
            <Button
              type="submit"
              width="100%"
              mt="$2"
              loading={otpForm.isSubmitting()}
            >
              {i18n().t('notificationChannel.email.addNew.otpForm.submitBtn')}
            </Button>
          </form>
        </Box>
      </Show>
    </Box>
  );
};

export default AddEmailForm;
