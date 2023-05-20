import { BirthdayDocument } from '@shared/types';
import {
  createContext,
  createResource,
  ParentComponent,
  ResourceReturn,
  useContext
} from 'solid-js';
import { useUserCtx } from '../user/user.context';
import { birthdayService } from './birthday.service';

const BirthdaysContext =
  createContext<ResourceReturn<BirthdayDocument[], unknown>>();
export const useBirthdaysCtx = () => useContext(BirthdaysContext)!;

export const BirthdaysProvider: ParentComponent = (props) => {
  const [userCtx] = useUserCtx();
  const resourceReturn = createResource(
    () => userCtx.user?.uid,
    (profileId) => birthdayService.findForProfile(profileId)
  );

  return (
    <BirthdaysContext.Provider value={resourceReturn}>
      {props.children}
    </BirthdaysContext.Provider>
  );
};
