import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { useSignOut } from '../../lib/user/signin';

type SignOutBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading' | 'children'
>;

const SignOutBtn: Component<SignOutBtnProps> = (props) => {
  const { signOut, isSigningOut } = useSignOut();

  return (
    <Button {...props} loading={isSigningOut()} onClick={signOut}>
      Sign out
    </Button>
  );
};

export default SignOutBtn;
