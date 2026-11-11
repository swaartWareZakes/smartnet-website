'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Menu,
  Moon,
  Sun,
  X,
  AudioLines,
} from 'lucide-react';

type Theme = 'dark' | 'light';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/#snx-contact' },
] as const;

export function SiteChrome({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let saved: string | null = null;

    try {
      saved = localStorage.getItem('smartnet-theme');
    } catch {
      // Private browsing may restrict storage.
    }

    const next: Theme = saved === 'light' ? 'light' : 'dark';

    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    const frame = window.requestAnimationFrame(
      () => setTheme(next)
    );

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setMenuOpen(false);
      };

      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [menuOpen]);

  function switchTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;

    try {
      localStorage.setItem('smartnet-theme', next);
    } catch {
      // Theme still works for the current page.
    }
  }

  function openNexus() {
    setMenuOpen(false);

    if (pathname === '/' || pathname === '/nexus') {
      window.dispatchEvent(new Event('smartnet:open-nexus'));
    } else {
      router.push('/?nexus=1');
    }
  }

  return (
    <>
      <header className="sn-global-header">
        <Link
          href="/"
          className="sn-global-brand"
          aria-label="SmartNet Technologies homepage"
          onClick={() => setMenuOpen(false)}
        >
          <span className="sn-global-monogram">SN</span>
          <span>
            <strong>SMARTNET</strong>
            <small>TECHNOLOGIES</small>
          </span>
        </Link>

        <nav
          className={`sn-global-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Primary navigation"
          id="smartnet-primary-navigation"
        >
          {LINKS.map((link) => {
            const active =
              link.href === pathname ||
              (link.href === '/' && pathname === '/nexus');

            return (
              <Link
                key={link.label}
                href={link.href}
                className={active ? 'is-active' : ''}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sn-global-actions">
          <button
            className="sn-global-theme"
            type="button"
            onClick={switchTheme}
            aria-label={`Switch to ${
              theme === 'dark' ? 'light' : 'dark'
            } mode`}
            title="Change website appearance"
          >
            {theme === 'dark'
              ? <Sun size={19} />
              : <Moon size={19} />}
          </button>

          <button
            type="button"
            className="sn-global-ai"
            onClick={openNexus}
          >
            <AudioLines size={18} />
            <span>ENTER NEXUS</span>
            <ArrowUpRight size={16} />
          </button>

          <button
            type="button"
            className="sn-global-menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="smartnet-primary-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      {children}
    </>
  );
}
