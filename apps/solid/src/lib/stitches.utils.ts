import { keyframes, SystemStyleObject } from '@hope-ui/solid';

const fadeIn = keyframes({
  '0%': { opacity: '0' },
  '100%': { opacity: '1' }
});

export const fadeInCss = (duration = 0.2): SystemStyleObject => ({
  animation: `${fadeIn} ${duration}s ease-in forwards`
});

export const delayedFadeInCss = (itemIndex: number): SystemStyleObject => ({
  opacity: 0,
  animation: `${fadeIn} 0.4s ${itemIndex / 20}s ease-in forwards`
});

const borderSpin = keyframes({
  '0%': {
    backgroundPosition: 'left top, right bottom, left bottom, right  top'
  },
  '100%': {
    backgroundPosition:
      'left 15px top, right 15px bottom , left bottom 15px , right   top 15px'
  }
});

export const borderSpinCss = (color = '$accent8'): SystemStyleObject => ({
  backgroundPosition: 'left top, right bottom, left bottom, right  top',
  backgroundImage: `linear-gradient(90deg, ${color} 50%, transparent 50%), linear-gradient(90deg, ${color} 50%, transparent 50%), linear-gradient(0deg, ${color} 50%, transparent 50%), linear-gradient(0deg, ${color} 50%, transparent 50%)`,
  backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
  backgroundSize: '15px 2px, 15px 2px, 2px 15px, 2px 15px',
  animation: `${borderSpin} 0.75s infinite linear`
});

export const waitForDrawerAnimation = () =>
  new Promise((resolve) => setTimeout(resolve, 550));
