/**
 * Check if current window is mobile/tablet browser
 */
export function isMobileView() {
  if (typeof window === 'undefined') {
    return false;
  }

  const ua = (window.navigator || navigator)?.userAgent ?? '';

  const rules = [
    'WebView',
    '(iPhone|iPod|iPad)(?!.*Safari/)',
    'Android.*(wv|.0.0.0)'
  ];

  const regex = new RegExp(`(${rules.join('|')})`, 'ig');

  return !!ua.match(regex);
}
