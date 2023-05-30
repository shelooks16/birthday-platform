import { Component } from 'solid-js';
import { Button, ButtonProps } from '@hope-ui/solid';
import { useSignOut } from '../../lib/user/signin';
import { useI18n } from '../../i18n.context';

type SignOutBtnProps = Omit<
  ButtonProps<'button'>,
  'onClick' | 'loading' | 'children'
>;

const SignOutBtn: Component<SignOutBtnProps> = (props) => {
  const [i18n] = useI18n();
  const { signOut, isSigningOut } = useSignOut();

  return (
    <Button {...props} loading={isSigningOut()} onClick={signOut}>
      {i18n().t('signin.signout.btn')}
    </Button>
  );
};

export default SignOutBtn;
