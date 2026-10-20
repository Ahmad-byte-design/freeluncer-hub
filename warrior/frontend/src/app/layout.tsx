import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@lib/core/tokens.css';
import '@lib/core/reset.css';
import '@lib/accordion/accordion.css';
import './globals.css';

/* Self-hosted so the build never depends on a font CDN. Latin subsets only;
   the woff2 files sit next to this module. */

const display = localFont({
  src: [
    { path: './fonts/chakra-petch-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/chakra-petch-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
});

const body = localFont({
  src: [{ path: './fonts/ibm-plex-sans.woff2', weight: '100 700', style: 'normal' }],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const mono = localFont({
  src: [{ path: './fonts/jetbrains-mono.woff2', weight: '100 800', style: 'normal' }],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
});

export const metadata: Metadata = {
  title: 'Warrior — utility-first CSS components',
  description:
    'Warrior is a dark-first, sharp-edged component library. Preview the markup, change the props, copy the source.',
};

/** Runs before paint so a light-theme visitor never sees a dark flash. */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('wr-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}