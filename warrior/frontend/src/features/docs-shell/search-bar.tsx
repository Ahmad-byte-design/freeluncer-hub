'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { components } from '@/registry';
import { cx } from '@/shared/utils';
import { CloseIcon, SearchIcon } from '@/shared/icons';
import { useShell } from './shell-state';

interface Match {
  slug: string;
  name: string;
  description: string;
  /** Which field matched, so the row can show it in context. */
  where: 'name' | 'description' | 'keyword';
}

function score(component: (typeof components)[number], query: string): Match | null {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return { slug: component.slug, name: component.name, description: component.description, where: 'name' };
  }

  const name = component.name.toLowerCase();
  if (name.startsWith(q)) {
    return { slug: component.slug, name: component.name, description: component.description, where: 'name' };
  }
  if (name.includes(q)) {
    return { slug: component.slug, name: component.name, description: component.description, where: 'name' };
  }
  if (component.description.toLowerCase().includes(q)) {
    return { slug: component.slug, name: component.name, description: component.description, where: 'description' };
  }
  if (component.keywords.some((keyword) => keyword.toLowerCase().startsWith(q))) {
    return { slug: component.slug, name: component.name, description: component.description, where: 'keyword' };
  }
  if (component.keywords.some((keyword) => keyword.toLowerCase().includes(q))) {
    return { slug: component.slug, name: component.name, description: component.description, where: 'keyword' };
  }
  return null;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (q.length === 0) return <>{text}</>;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="wr-search__mark">{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}

export function SearchBar() {
  const router = useRouter();
  const { searchOpen, setSearchOpen } = useShell();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = 'wr-search-results';

  const results = query.trim()
    ? components
        .map((component) => score(component, query))
        .filter((match): match is Match => match !== null)
    : [];

  /* One dismiss path for every way out — scrim click, Escape, and picking a
     result — so none of them can leave the panel mounted. The scrim used to
     be tied to `results.length > 0` while visibility was tied to searchOpen,
     so a query with no matches rendered a full-screen scrim that stayed up
     and swallowed every click on the page. */
  const dismiss = useCallback(() => {
    setQuery('');
    setActive(0);
    setSearchOpen(false);
    inputRef.current?.blur();
  }, [setSearchOpen]);

  const showResults = searchOpen && query.trim().length > 0;

  const go = (slug: string) => {
    setQuery('');
    setActive(0);
    setSearchOpen(false);
    router.push(`/components/${slug}`);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      const match = results[active];
      if (match) {
        event.preventDefault();
        go(match.slug);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
    }
  };

  const open = showResults && results.length > 0;

  return (
    <div className="wr-search">
      <div className="wr-search__field">
        <SearchIcon size={15} className="wr-search__icon" />
        <input
          ref={inputRef}
          type="text"
          className="wr-search__input"
          placeholder="Find a component"
          aria-label="Find a component"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open ? `wr-search-opt-${results[active]?.slug}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="wr-search__clear"
            aria-label="Clear search"
            onClick={dismiss}
          >
            <CloseIcon size={13} />
          </button>
        ) : (
          <kbd className="wr-search__kbd" aria-hidden="true">
            Ctrl K
          </kbd>
        )}
      </div>

      {showResults ? (
        <>
          <button
            type="button"
            className="wr-scrim wr-scrim--search"
            aria-label="Close results"
            tabIndex={-1}
            onClick={dismiss}
          />
          {open ? (
            <ul className="wr-search__results" id={listId} role="listbox" aria-label="Components">
              {results.map((match, index) => (
                <li key={match.slug} role="none">
                  <button
                    type="button"
                    id={`wr-search-opt-${match.slug}`}
                    role="option"
                    aria-selected={index === active}
                    data-active={index === active}
                    className={cx('wr-search__opt', index === active && 'is-active')}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(match.slug)}
                  >
                    <span className="wr-search__name">
                      <Highlight text={match.name} query={query} />
                    </span>
                    <span className="wr-search__desc">
                      {match.where === 'keyword' ? (
                        <span className="wr-search__tag">matches “{query.trim()}”</span>
                      ) : (
                        <Highlight text={match.description} query={query} />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="wr-search__empty" id={listId}>
              Nothing matches <span className="wr-search__mark">{query.trim()}</span>.
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}