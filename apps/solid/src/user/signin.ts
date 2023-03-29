import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";
import { userService } from "../lib/user.service";
import { useUserCtx } from "./UserContext";

export const useGoogleSignin = (redirectLocation = "/dash") => {
  const [, { setUser }] = useUserCtx();
  const navigate = useNavigate();

  onMount(async () => {
    const result = await userService.getRedirectResult();

    if (result) {
      setUser(result.user);
      navigate(redirectLocation);
    }
  });

  return async () => {
    const credential = await userService.signinWithGoogle();

    if (credential) {
      setUser(credential.user);
      navigate(redirectLocation);
    }
  };
};

export const useSignOut = (redirectLocation = "/") => {
  const [, { setUser }] = useUserCtx();
  const navigate = useNavigate();

  return async () => {
    await userService.signOut();
    setUser();
    navigate(redirectLocation);
  };
};
