import {
  HopeProvider,
  NotificationsProvider,
  globalCss,
  HopeThemeConfig
} from '@hope-ui/solid';
import { ParentComponent } from 'solid-js';

const globalStyles = globalCss({
  html: {
    // '::-webkit-scrollbar': {
    //   width: '5px'
    // },
    // '::-webkit-scrollbar-track': {
    //   background: '#f1f1f1'
    // },
    // '::-webkit-scrollbar-thumb': {
    //   background: '#888'
    // },
    // '::-webkit-scrollbar-thumb:hover': {
    //   background: '#555'
    // },
    // scroll always
    // overflowY: 'scroll',
    // overscrollBehavior: 'contain'
  }
});

const theme: HopeThemeConfig = {
  lightTheme: {
    colors: {
      // focusRing: '#1e1e1e'
    },
    shadows: {
      // outline: '0 0 0px 1px var(--hope-colors-focusRing)'
    }
  }
};

export const ThemeProvider: ParentComponent = (props) => {
  globalStyles();

  return (
    <HopeProvider config={theme}>
      <NotificationsProvider placement="top" duration={5000}>
        {props.children}
      </NotificationsProvider>
    </HopeProvider>
  );
};
