'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

interface ShellContextValue {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  closeNav: () => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  closeSheet: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  closeAll: () => void;
  /** The control that opened each overlay, so focus can be handed back. */
  navTriggerRef: RefObject<HTMLButtonElement | null>;
  sheetTriggerRef: RefObject<HTMLButtonElement | null>;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [navOpen, setNav] = useState(false);
  const [sheetOpen, setSheet] = useState(false);
  const [searchOpen, setSearch] = useState(false);

  const navTriggerRef = useRef<HTMLButtonElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);

  /* Opening any overlay dismisses the others. Search used to be left out of
     this, so its scrim stayed mounted behind a drawer and swallowed clicks. */
  const setNavOpen = useCallback((open: boolean) => {
    setNav(open);
    if (open) {
      setSheet(false);
      setSearch(false);
    }
  }, []);

  const setSheetOpen = useCallback((open: boolean) => {
    setSheet(open);
    if (open) {
      setNav(false);
      setSearch(false);
    }
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    setSearch(open);
    if (open) {
      setNav(false);
      setSheet(false);
    }
  }, []);

  const closeNav = useCallback(() => setNav(false), []);
  const closeSheet = useCallback(() => setSheet(false), []);

  const closeAll = useCallback(() => {
    setNav(false);
    setSheet(false);
    setSearch(false);
  }, []);

  const value = useMemo<ShellContextValue>(
    () => ({
      navOpen,
      sheetOpen,
      searchOpen,
      setNavOpen,
      closeNav,
      setSheetOpen,
      closeSheet,
      setSearchOpen,
      closeAll,
      navTriggerRef,
      sheetTriggerRef,
    }),
    [
      navOpen,
      sheetOpen,
      searchOpen,
      setNavOpen,
      closeNav,
      setSheetOpen,
      closeSheet,
      setSearchOpen,
      closeAll,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const context = useContext(ShellContext);
  if (!context) throw new Error('useShell must be used inside <ShellProvider>');
  return context;
}
