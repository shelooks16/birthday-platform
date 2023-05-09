import { createEffect, onCleanup } from 'solid-js';

const cheatcodes = ['hesoyam'];

export const useCheatCodes = () => {
  let listener: (event: KeyboardEvent) => any;

  createEffect(() => {
    if ('ontouchstart' in window || 'onmsgesturechange' in window) return;

    const maxLength = Math.max.apply(
      null,
      cheatcodes.map((s) => s.length)
    );

    let pressed = '';

    listener = (event) => {
      pressed += event.key;

      const entered =
        pressed.length <= maxLength ? pressed : pressed.slice(maxLength * -1);

      if (cheatcodes.includes(entered)) {
        alert('ACRIVATED');
      }
    };

    document.addEventListener('keydown', listener);
  });

  onCleanup(() => {
    listener && document.removeEventListener('keydown', listener);
  });
};
