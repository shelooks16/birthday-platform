import { createEffect, createSignal } from 'solid-js';
import {
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  createDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  Button,
  FormErrorMessage
} from '@hope-ui/solid';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';
import { useUserProfileCtx } from '../lib/user/user-profile.context';
import { profileService } from '../lib/user/profile.service';
import TimeZonePicker from './timezone-picker';
import { Modal, ModalOverlay } from './Modal';
import { userService } from '../lib/user/user.service';

const schema = yup.object({
  timeZone: yup
    .string()
    .required('Timezone is required')
    .trim()
    .min(4, 'Timezone is required')
});
type SubmitData = yup.InferType<typeof schema>;

type FormProps = {
  onAfterSubmit?: (data: SubmitData) => any;
};

const Form = (props: FormProps) => {
  const { form, errors, data, setFields, isSubmitting } =
    createForm<SubmitData>({
      extend: validator({ schema: schema as any }),
      onSubmit: async (values) => {
        const currentUser = await userService.getAuthUser({
          throwIfNull: true
        });
        const db = await profileService.db();

        await db.updateOne({
          id: currentUser!.uid,
          ...values
        });
        await props.onAfterSubmit?.(values);
      }
    });

  return (
    <form ref={form}>
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
          So notifications will be delivered to you on time
        </FormHelperText>
      </FormControl>

      <Button mt="$4" type="submit" width="100%" loading={isSubmitting()}>
        Save
      </Button>
    </form>
  );
};

export default function FinishProfileModal() {
  const [profilectx] = useUserProfileCtx();
  const [alreadyShown, setAlreadyShown] = createSignal(false);
  const { isOpen, onOpen, onClose } = createDisclosure();

  createEffect(() => {
    if (profilectx.profile && !profilectx.profile.timeZone && !alreadyShown()) {
      onOpen();

      setAlreadyShown(true);
    }
  });

  return (
    <Modal opened={isOpen()} onClose={onClose} motionPreset="fade-in-bottom">
      <ModalOverlay />
      <ModalContent mx="$1">
        <ModalCloseButton size="sm" />
        <ModalHeader>Setup profile</ModalHeader>
        <Divider />
        <ModalBody my="$2">
          <Form onAfterSubmit={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
