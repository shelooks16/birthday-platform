import { Title } from '@solidjs/meta';
import { ParentComponent } from 'solid-js';

const staticText = 'Buddy Birthday';

const PageTitle: ParentComponent = (props) => {
  return (
    <Title>
      {props.children ? props.children + ' | ' + staticText : staticText}
    </Title>
  );
};

export default PageTitle;
