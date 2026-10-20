'use client';

import type { ReactNode } from 'react';
import { getBySlug } from '@/registry';
import type { ComponentAssets } from '@/registry';
import { DocsProvider } from '@/shared/component-provider';
import { ShellProvider } from './shell-state';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Customizer } from './customizer';
import './docs-shell.css';

/**
 * The frame. Owns the two client boundaries the page needs — the shell (nav,
 * drawers, theme, search) and the per-component state (customizer values).
 *
 * Only the slug crosses the server/client boundary: the registry entry carries
 * functions, so it is looked up again on this side rather than serialized.
 */
export function DocsShell({
  slug,
  assets,
  children,
}: {
  slug: string;
  assets: ComponentAssets;
  children: ReactNode;
}) {
  const meta = getBySlug(slug);
  if (!meta) return null;

  return (
    <ShellProvider>
      <DocsProvider key={meta.slug} meta={meta} assets={assets}>
        <a className="wr-skip-link" href="#main">
          Skip to content
        </a>
        <div className="wr-app">
          <Header />
          <Sidebar />
          <main className="wr-rail-main" id="main" tabIndex={-1}>
            {children}
          </main>
          <Customizer />
        </div>
      </DocsProvider>
    </ShellProvider>
  );
}