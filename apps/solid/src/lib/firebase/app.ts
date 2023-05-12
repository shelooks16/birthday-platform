/**
 * https://gist.github.com/dyaa/8f8d1f8964160630f2475fe26a2e6150?permalink_comment_id=4065558#gistcomment-4065558
 */
import { appConfig } from '../../appConfig';
import { initializeApp, getApp, getApps } from 'firebase/app';

const setupFirebase = () => {
  if (getApps.length) return getApp();

  return initializeApp(appConfig.env.firebaseConfig);
};

export const app = setupFirebase();
