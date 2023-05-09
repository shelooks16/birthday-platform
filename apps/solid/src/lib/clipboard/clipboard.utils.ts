/**
 * Copy string to clipboard.
 *
 * Returns boolean which indicates whether the copying was successful.
 */
export async function copyToClipboard(input: string): Promise<boolean> {
  // (1) check modern async api
  if ('clipboard' in navigator) {
    try {
      await navigator.clipboard.writeText(input);
      return true;
    } catch (err) {
      console.log('Skip Clipboard API: failed or not supported');
    }
  }

  // (2) old solution
  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement as HTMLElement | null;

  element.value = input;

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '');

  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt'; // Prevent zooming on iOS

  const selection = document.getSelection();
  const originalRange =
    selection && selection.rangeCount > 0 && selection.getRangeAt(0);

  document.body.append(element);
  element.select();

  // Explicit selection workaround for iOS
  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;

  try {
    isSuccess = document.execCommand('copy');
  } catch {
    console.log(`Skip execCommand('copy'): failed or not supported`);
  }

  element.remove();

  if (originalRange && selection) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }

  return isSuccess;
}
