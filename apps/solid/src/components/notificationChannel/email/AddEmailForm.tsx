import { Show, createSignal, Component, onMount } from 'solid-js';
import {
  Alert,
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
import { channelService } from '../../../lib/channel/channel.service';
import { fadeInCss } from '../../../lib/stitches.utils';
import { IconArrowLeft } from '../../Icons';
import { useNotificationChannelsCtx } from '../../../lib/notificationChannel/notificationChannels.context';

type AddEmailFormProps = {
  onAfterSubmit?: (data: ConfirmEmailOtpResult) => any;
};

const AddEmailForm: Component<AddEmailFormProps> = (props) => {
  const [, { mutate }] = useNotificationChannelsCtx();

  const [verificationInfo, setVerificationInfo] =
    createSignal<SendEmailVerificationResult | null>(null);

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
      const result = await channelService.sendEmailVerification({
        email: values.email
      });
      setVerificationInfo(result);
      setLastVerification('result', result);
    }
  });

  const otpForm = createForm({
    initialValues: {
      otp: ''
    },
    onSubmit: async (values) => {
      setSubmitError(null);

      try {
        const result = await channelService.confirmEmailOtp({
          email: verificationInfo()!.email,
          otpGuess: values.otp
        });
        lastVerificationAction.remove('result');

        mutate((p) => (p ? p.concat(result.channel) : p));

        props.onAfterSubmit?.(result);
      } catch (err) {
        setSubmitError(err);
        return;
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
          <Box css={fadeInCss()}>
            <form ref={emailForm.form}>
              <FormControl required invalid={!!emailForm.errors('email')}>
                <FormLabel for="email">Email to add</FormLabel>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autocomplete="off"
                  placeholder="Enter email here"
                />
                <FormErrorMessage>
                  {emailForm.errors('email')?.[0]}
                </FormErrorMessage>
              </FormControl>
              <Button
                type="submit"
                width="100%"
                mt="$2"
                loading={emailForm.isSubmitting()}
              >
                Send email verification
              </Button>
            </form>
          </Box>
        }
      >
        <Box mb="$2">
          <Button
            onClick={handleCancelEmail}
            variant="ghost"
            size="sm"
            display="flex"
            pl="$0"
          >
            <IconArrowLeft fontSize="$xl" />
            <Box ml="$2">Change email</Box>
          </Button>
        </Box>
        <Box css={fadeInCss()}>
          <form ref={otpForm.form}>
            <FormControl invalid={!!otpForm.errors('otp')}>
              <FormLabel for="otp">
                Enter code sent to {verificationInfo()?.email}
              </FormLabel>
              <Input
                type="text"
                placeholder="Code from email"
                id="otp"
                name="otp"
                autocomplete="off"
              />
              <FormErrorMessage>{otpForm.errors('otp')?.[0]}</FormErrorMessage>
              <FormHelperText>
                The code expires on{' '}
                {new Date(verificationInfo()!.expiresAt).toLocaleTimeString()}
              </FormHelperText>
            </FormControl>
            <Show when={submitError()}>
              <Alert status="danger" mt="$2" variant="left-accent">
                {submitError()?.message}
              </Alert>
            </Show>
            <Button
              type="submit"
              width="100%"
              mt="$2"
              loading={otpForm.isSubmitting()}
            >
              Confirm code
            </Button>
          </form>
        </Box>
      </Show>
    </Box>
  );
};

export default AddEmailForm;
