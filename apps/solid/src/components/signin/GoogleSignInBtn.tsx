import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { IconGoogle } from '../Icons';
import { useGoogleSignin } from '../../lib/user/signin';
import { useI18n } from '../../i18n.context';

export { useHandleGoogleSigninRedirect } from '../../lib/user/signin';

type GoogleSignInBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'leftIcon' | 'children'
>;

const GoogleSignInBtn: Component<GoogleSignInBtnProps> = (props) => {
  const [i18n] = useI18n();
  const { signInWithGoogle, isSigningInWithGoogle } = useGoogleSignin();

  return (
    <Button
      {...props}
      leftIcon={<IconGoogle />}
      loading={props.loading || isSigningInWithGoogle()}
      onClick={signInWithGoogle}
    >
      {i18n().t('signin.googleLogin.btn')}
    </Button>
  );
};

export default GoogleSignInBtn;
