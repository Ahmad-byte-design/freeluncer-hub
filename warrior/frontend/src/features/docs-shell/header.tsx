'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { components } from '@/registry';
import { CheckIcon, CloseIcon, CopyIcon, Logo, MenuIcon } from '@/shared/icons';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';
import { useShell } from './shell-state';

const INSTALL = 'npm i warrior';

function InstallButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className="wr-install"
      data-copied={copied}
      onClick={copy}
      aria-label={copied ? 'Install command copied' : 'Copy the install command'}
    >
      <span className="wr-install__cmd">{INSTALL}</span>
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
    </button>
  );
}

export function Header() {
  const { navOpen, setNavOpen, closeAll, navTriggerRef } = useShell();

  return (
    <header className="wr-head">
      <div className="wr-head__brand">
        <button
          type="button"
          ref={navTriggerRef}
          id="wr-nav-toggle"
          className="wr-btn wr-btn--ghost wr-btn--icon wr-head__menu"
          onClick={() => setNavOpen(!navOpen)}
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Close component list' : 'Open component list'}
          aria-controls="wr-nav-drawer"
        >
          {navOpen ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
        </button>
        <Link
          href={`/components/${components[0]?.slug ?? 'accordion'}`}
          className="wr-brand"
          onClick={closeAll}
        >
          <Logo size={26} />
          <span className="wr-brand__word">WARRIOR</span>
        </Link>
      </div>

      <div className="wr-head__search">
        <SearchBar />
      </div>

      <div className="wr-head__actions">
        <InstallButton />
        <ThemeToggle />
      </div>
    </header>
  );
}