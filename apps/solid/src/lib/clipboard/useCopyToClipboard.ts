import { createSignal, createEffect, onCleanup, Accessor } from 'solid-js';
import { copyToClipboard } from './clipboard.utils';

export function useCopyToClipboard(text: Accessor<any>, timeout = 1500) {
  const [hasCopied, setHasCopied] = createSignal(false);

  const copy = async () => {
    const didCopy = await copyToClipboard(text());
    setHasCopied(didCopy);
  };

  let timeoutId: number | null = null;

  createEffect(() => {
    if (hasCopied()) {
      timeoutId = window.setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    }
  });

  onCleanup(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });

  return { copyToClipboard: copy, hasCopied };
}
