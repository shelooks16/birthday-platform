import { ParentComponent } from 'solid-js';
import { Container } from '@hope-ui/solid';

const GlobalContainer: ParentComponent = (props) => {
  return (
    <Container
      px="$3"
      pt="$3"
      pb={{ '@initial': '$10', '@md': '$20' }}
      maxWidth={{ '@lg': 750 }}
    >
      {props.children}
    </Container>
  );
};

export default GlobalContainer;
