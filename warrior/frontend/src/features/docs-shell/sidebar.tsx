'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { components } from '@/registry';
import { useDocs } from '@/shared/component-provider';
import { useShell } from './shell-state';
import { useModalDrawer } from './use-modal-drawer';

export function Sidebar() {
  const pathname = usePathname() ?? '';
  const { meta } = useDocs();
  const { navOpen, closeNav, navTriggerRef } = useShell();
  const asideRef = useRef<HTMLElement>(null);
  const activeSlug = pathname.split('/').filter(Boolean).pop() ?? '';

  useModalDrawer({
    open: navOpen,
    containerRef: asideRef,
    triggerRef: navTriggerRef,
    onClose: closeNav,
  });

  /* Derived from the registry rather than hard-coded, so the list cannot
     drift from the sections a page actually renders — it used to omit Files
     and to link Keyboard on components that have no keyboard section. */
  const pageSections = useMemo(() => {
    const sections = [
      { href: '#specimen', label: 'Specimen' },
      { href: '#variants', label: 'Variants' },
      { href: '#props', label: 'Props' },
    ];
    if (meta.keyboard?.length) sections.push({ href: '#keyboard', label: 'Keyboard' });
    sections.push({ href: '#files', label: 'Files' });
    return sections;
  }, [meta]);

  return (
    <>
      {navOpen ? (
        <button
          type="button"
          className="wr-scrim"
          aria-label="Close component list"
          onClick={closeNav}
        />
      ) : null}

      <aside
        ref={asideRef}
        className="wr-rail-left"
        id="wr-nav-drawer"
        data-open={navOpen}
        aria-label="Components"
        tabIndex={-1}
      >
        <div className="wr-rail__pad">
          <nav aria-label="Components">
            <p className="wr-rail__label" id="wr-nav-components">
              Components
            </p>
            <ul className="wr-rail__list" aria-labelledby="wr-nav-components">
              {components.map((component) => (
                <li key={component.slug}>
                  <Link
                    href={`/components/${component.slug}`}
                    className="wr-navitem"
                    data-active={component.slug === activeSlug}
                    aria-current={component.slug === activeSlug ? 'page' : undefined}
                    onClick={closeNav}
                  >
                    <span className="wr-navitem__name">{component.name}</span>
                    <span
                      className="wr-navitem__status"
                      data-status={component.status}
                      title={component.status}
                      aria-hidden="true"
                    />
                    {/* A 5px dot carried the status by colour alone; the label
                        is what a screen reader — and anyone who cannot separate
                        ember from victory — actually gets. */}
                    <span className="wr-visually-hidden">{component.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="wr-rail__section" aria-label="On this page">
            <p className="wr-rail__label">On this page</p>
            <ul className="wr-rail__list">
              {pageSections.map((section) => (
                <li key={section.href}>
                  <a
                    href={section.href}
                    className="wr-navitem wr-navitem--sub"
                    onClick={closeNav}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="wr-rail__foot">
            <p className="wr-rail__note">
              One component so far. A second one needs a{' '}
              <code>lib/&lt;name&gt;/</code> folder and one registry file.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
