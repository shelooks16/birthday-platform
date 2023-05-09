import {
  createSignal,
  onMount,
  Accessor,
  onCleanup,
  ParentComponent,
  createContext,
  useContext
} from 'solid-js';
import {
  Modal as HopeModal,
  ModalOverlay as HopeModalOverlay,
  Drawer as HopeDrawer,
  DrawerOverlay as HopeDrawerOverlay,
  ModalOverlayProps,
  DrawerProps,
  ModalProps
} from '@hope-ui/solid';
import { MemoryCache } from '@shared/memory-cache';

const Z_INDEX_CACHE_KEY = 'zIndexModal';

/**
 * Correctly manage nested modals z-index since hope-ui does not manage nested z-index in modals :(
 */
const useManageZIndex = (): Accessor<ModalOverlayProps<'div'>> => {
  const [myIdx, setMyIdx] = createSignal(0);

  const props = (): ModalOverlayProps<'div'> => {
    const zOverlay = `calc($modal + ${myIdx()})`;
    const zContent = `calc($modal + ${myIdx() + 1})`;

    return {
      css: {
        zIndex: zOverlay,
        '& + div': {
          zIndex: zContent
        }
      }
    };
  };

  onMount(() => {
    setMyIdx(MemoryCache.getOrSet(Z_INDEX_CACHE_KEY, () => 0));

    MemoryCache.set<number>(Z_INDEX_CACHE_KEY, (val) => val! + 1);
  });

  onCleanup(() => {
    MemoryCache.set<number>(Z_INDEX_CACHE_KEY, (val) => (val ? val - 1 : 0));
  });

  return props;
};

type ZIndexCtxInterface = Accessor<ModalOverlayProps<'div'>>;

const ZIndexCtx = createContext<ZIndexCtxInterface>({} as ZIndexCtxInterface);

export const Modal: ParentComponent<ModalProps> = (props) => {
  const managerProps = useManageZIndex();
  return (
    <ZIndexCtx.Provider value={managerProps}>
      <HopeModal {...props} />
    </ZIndexCtx.Provider>
  );
};

export const ModalOverlay: ParentComponent<ModalOverlayProps<'div'>> = (
  props
) => {
  const managerProps = useContext(ZIndexCtx);
  return <HopeModalOverlay {...managerProps()} {...props} />;
};

export const Drawer: ParentComponent<DrawerProps> = (props) => {
  const managerProps = useManageZIndex();
  return (
    <ZIndexCtx.Provider value={managerProps}>
      <HopeDrawer {...props} />
    </ZIndexCtx.Provider>
  );
};

export const DrawerOverlay: ParentComponent<ModalOverlayProps<'div'>> = (
  props
) => {
  const managerProps = useContext(ZIndexCtx);
  return <HopeDrawerOverlay {...managerProps()} {...props} />;
};
