/* eslint-disable solid/no-innerhtml */
import {
  Alert,
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
import { GenerateBirthdayWishResult } from '@shared/types';
import { createSignal, ParentComponent, splitProps, Show } from 'solid-js';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { useCopyToClipboard } from '../../lib/clipboard/useCopyToClipboard';
import { waitForModalAnimation } from '../../lib/stitches.utils';
import { IconArrowLeft, IconArrowRight } from '../Icons';
import { Modal, ModalOverlay } from '../Modal';

type GenerateBirthdayWishBtnProps = {
  birthdayId: string;
  onBeforeOpen?: () => any;
  onAfterClose?: () => any;
} & ButtonProps;

const GenerateBirthdayWishBtn: ParentComponent<GenerateBirthdayWishBtnProps> = (
  props
) => {
  const [localProps, btnProps] = splitProps(props, [
    'birthdayId',
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
        birthdayId: localProps.birthdayId,
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
        Поздравить {props.children}
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
          <ModalHeader>Special birthday wish</ModalHeader>
          <Divider />
          <ModalBody my="$2">
            <Show when={regenerateError()}>
              <Alert status="danger" mb="$4">
                {regenerateError()!.message}
              </Alert>
            </Show>
            <Show when={result()}>
              <HStack mb="$2" justifyContent="space-between">
                <Box fontSize="$xs" color="$neutral10">
                  Attempt {visibleAttempt() + 1}/{result()!.generateMaxCount}
                </Box>
                <ButtonGroup attached size="xs" variant="outline">
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
              <Box innerHTML={getVisibleWish()} />

              <HStack justifyContent="space-between" mt="$4" gap="$4">
                <Button size="sm" onClick={copyToClipboard}>
                  {hasCopied() ? 'Текст скопирован' : 'Скопировать'}
                </Button>
                <Button
                  size="sm"
                  onClick={regenerate}
                  loading={isLoading()}
                  variant="ghost"
                  disabled={
                    result()!.generatedCount === result()!.generateMaxCount
                  }
                >
                  Переделать
                </Button>
              </HStack>
            </Show>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateBirthdayWishBtn;
