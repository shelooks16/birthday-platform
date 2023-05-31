/* eslint-disable solid/no-innerhtml */
import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  createDisclosure,
  Divider,
  HStack,
  IconButton,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  notificationService
} from '@hope-ui/solid';
import { BirthdayDocument, GenerateBirthdayWishResult } from '@shared/types';
import { createSignal, ParentComponent, splitProps, Show } from 'solid-js';
import { useI18n } from '../../i18n.context';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { useCopyToClipboard } from '../../lib/clipboard/useCopyToClipboard';
import { waitForModalAnimation } from '../../lib/stitches.utils';
import ErrorMessage from '../error/ErrorMessage';
import { IconArrowLeft, IconArrowRight } from '../Icons';
import { Modal, ModalOverlay } from '../Modal';

type GenerateBirthdayWishBtnProps = {
  birthday: Pick<BirthdayDocument, 'id' | 'buddyName'>;
  onBeforeOpen?: () => any;
  onAfterClose?: () => any;
} & ButtonProps;

const GenerateBirthdayWishBtn: ParentComponent<GenerateBirthdayWishBtnProps> = (
  props
) => {
  const [i18n] = useI18n();
  const [localProps, btnProps] = splitProps(props, [
    'birthday',
    'onBeforeOpen',
    'onAfterClose'
  ]);
  const { isOpen, onOpen, onClose } = createDisclosure();
  const [visibleAttempt, setVisibleAttempt] = createSignal(0);
  const [result, setResult] = createSignal<GenerateBirthdayWishResult | null>(
    null
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [regenerateError, setRegenerateError] = createSignal<Error | null>(
    null
  );

  const getVisibleWish = () => {
    const r = result();

    if (!r) return '';

    return r.wishes[visibleAttempt()] ?? '';
  };

  const { copyToClipboard, hasCopied } = useCopyToClipboard(getVisibleWish);

  const generateWish = async (clampToLimit = false) => {
    setIsLoading(true);

    try {
      const result = await birthdayService.generateBirthdayWish({
        birthdayId: localProps.birthday.id,
        clampToLimit
      });

      setResult(result);
      setVisibleAttempt(result.generatedCount - 1);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const generateOnOpen = async () => {
    try {
      await generateWish(true);
      localProps.onBeforeOpen?.();
      onOpen();
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: err.message
      });
    }
  };

  const regenerate = async () => {
    try {
      await generateWish();
      setRegenerateError(null);
    } catch (err) {
      setRegenerateError(err);
    }
  };

  const handleClose = async () => {
    onClose();
    await waitForModalAnimation();
    localProps.onAfterClose?.();
  };

  return (
    <>
      <Button {...btnProps} onClick={generateOnOpen} loading={isLoading()}>
        {i18n().t('birthday.generateWish.greetBuddyBtn', {
          buddyName: localProps.birthday.buddyName
        })}
      </Button>

      <Modal
        opened={isOpen()}
        onClose={handleClose}
        motionPreset="fade-in-bottom"
        scrollBehavior="inside"
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            {i18n().t('birthday.generateWish.title', {
              buddyName: localProps.birthday.buddyName
            })}
          </ModalHeader>
          <Divider />
          <ModalBody my="$2">
            <Show when={regenerateError()}>
              <ErrorMessage mb="$4">{regenerateError()!.message}</ErrorMessage>
            </Show>
            <Show when={result()}>
              <HStack mb="$2" justifyContent="space-between">
                <Box fontSize="$sm" color="$neutral10">
                  {i18n().t('birthday.generateWish.attempt', {
                    currentAttempt: visibleAttempt() + 1,
                    totalAttempts: result()!.generateMaxCount
                  })}
                </Box>
                <ButtonGroup attached size="sm" variant="outline">
                  <IconButton
                    onClick={() => setVisibleAttempt((p) => p - 1)}
                    disabled={visibleAttempt() === 0}
                    aria-label="Previous"
                    icon={<IconArrowLeft />}
                  />
                  <IconButton
                    onClick={() => setVisibleAttempt((p) => p + 1)}
                    disabled={visibleAttempt() === result()!.generatedCount - 1}
                    aria-label="Next"
                    icon={<IconArrowRight />}
                  />
                </ButtonGroup>
              </HStack>
              <Box innerHTML={getVisibleWish()} fontSize="$base" />

              <HStack justifyContent="space-between" mt="$4" gap="$4">
                <Button size="sm" onClick={copyToClipboard}>
                  {hasCopied()
                    ? i18n().t('birthday.generateWish.copyBtn.copied')
                    : i18n().t('birthday.generateWish.copyBtn.clickToCopy')}
                </Button>
                <Show
                  when={result()!.generatedCount !== result()!.generateMaxCount}
                >
                  <Button
                    size="sm"
                    onClick={regenerate}
                    loading={isLoading()}
                    variant="ghost"
                  >
                    {i18n().t('birthday.generateWish.regenerateBtn')}
                  </Button>
                </Show>
              </HStack>
            </Show>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateBirthdayWishBtn;
