import { Alert, AlertProps, ListItem, UnorderedList } from '@hope-ui/solid';
import { ParentComponent, For, splitProps } from 'solid-js';

type ErrorMessageProps = {
  errors: string[];
} & Omit<AlertProps, 'status'>;

const ErrorMessageList: ParentComponent<ErrorMessageProps> = (props) => {
  const [localProps, alertProps] = splitProps(props, ['errors']);

  return (
    <Alert {...alertProps} status="danger">
      <UnorderedList>
        <For each={localProps.errors}>
          {(msg) => <ListItem>{msg}</ListItem>}
        </For>
      </UnorderedList>
    </Alert>
  );
};

export default ErrorMessageList;
