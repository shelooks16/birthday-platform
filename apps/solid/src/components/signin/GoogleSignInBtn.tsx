import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { IconGoogle } from '../Icons';
import { useGoogleSignin } from '../../lib/user/signin';

type GoogleSignInBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading' | 'leftIcon' | 'children'
>;

const GoogleSignInBtn: Component<GoogleSignInBtnProps> = (props) => {
  const { signInWithGoogle, isSigningInWithGoogle } = useGoogleSignin();

  return (
    <Button
      {...props}
      leftIcon={<IconGoogle />}
      loading={isSigningInWithGoogle()}
      onClick={signInWithGoogle}
    >
      Continue with Google
    </Button>
  );
};

export default GoogleSignInBtn;
