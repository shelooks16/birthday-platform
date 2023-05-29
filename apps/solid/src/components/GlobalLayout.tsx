import { ParentComponent } from 'solid-js';
import { Box, Container } from '@hope-ui/solid';
import ColorModeToggle from './ColorModeToggle';

const GlobalLayout: ParentComponent = (props) => {
  return (
    <Container
      px="$3"
      pt="$3"
      pb={{ '@initial': '$10', '@md': '$20' }}
      maxWidth={{ '@lg': 750 }}
    >
      <Box position="relative" zIndex={'$docked'}>
        <Box position="absolute" right={0} top={0}>
          <ColorModeToggle id="color-toggle" />
        </Box>
      </Box>

      {props.children}
    </Container>
  );
};

export default GlobalLayout;
