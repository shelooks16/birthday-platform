import { Title } from '@solidjs/meta';
import { ParentComponent } from 'solid-js';
import { appConfig } from '../appConfig';

const PageTitle: ParentComponent = (props) => {
  return (
    <Title>
      {props.children
        ? props.children + ' | ' + appConfig.platformName
        : appConfig.platformName}
    </Title>
  );
};

export default PageTitle;
