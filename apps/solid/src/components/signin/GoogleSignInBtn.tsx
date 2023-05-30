import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { IconGoogle } from '../Icons';
import { useGoogleSignin } from '../../lib/user/signin';
import { useI18n } from '../../i18n.context';

type GoogleSignInBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading' | 'leftIcon' | 'children'
>;

const GoogleSignInBtn: Component<GoogleSignInBtnProps> = (props) => {
  const [i18n] = useI18n();
  const { signInWithGoogle, isSigningInWithGoogle } = useGoogleSignin();

  return (
    <Button
      {...props}
      leftIcon={<IconGoogle />}
      loading={isSigningInWithGoogle()}
      onClick={signInWithGoogle}
    >
      {i18n().t('signin.googleLogin.btn')}
    </Button>
  );
};

export default GoogleSignInBtn;
