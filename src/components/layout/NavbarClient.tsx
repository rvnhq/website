import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { Search, Menu, X } from 'lucide-react';

interface Props {
    currentPath?: string;
}

interface PagefindResultData {
    url: string;
    excerpt?: string;
    meta?: {
        title?: string;
    };
}

interface PagefindSearchResult {
    data: () => Promise<PagefindResultData>;
}

interface PagefindApi {
    init: () => Promise<void> | void;
    search: (query: string) => Promise<{ results: PagefindSearchResult[] }>;
}

interface SearchItem {
    url: string;
    title: string;
    excerpt: string;
}

const SEARCH_RESULT_LIMIT = 8;
const DEV_SEARCH_MESSAGE = 'Search is available in production preview after running `bun run build`.';

export default function NavbarClient({ currentPath = '/' }: Props) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const pagefindRef = useRef<PagefindApi | null>(null);
    const searchRequestRef = useRef(0);



    const closeSearch = useCallback(() => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError(null);
        searchRequestRef.current += 1;
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }

            if (e.key === 'Escape') {
                closeSearch();
                setMobileOpen(false);
            }
        };

        window.addEventListener('keydown', handleKey);

        return () => window.removeEventListener('keydown', handleKey);
    }, [closeSearch]);

    useEffect(() => {
        if (!searchOpen || pagefindRef.current) return;

        let cancelled = false;

        const loadPagefind = async () => {
            try {
                const pagefindPath = '/pagefind/pagefind.js';
                const importedModule = await import(/* @vite-ignore */ pagefindPath);
                const pagefind = ((importedModule as { default?: PagefindApi }).default ?? importedModule) as PagefindApi;

                if (!pagefind || typeof pagefind.search !== 'function') {
                    throw new Error('Invalid pagefind API');
                }

                await pagefind.init();

                if (!cancelled) {
                    pagefindRef.current = pagefind;
                    setSearchError(null);
                }
            } catch {
                if (!cancelled && import.meta.env.DEV) {
                    setSearchError(DEV_SEARCH_MESSAGE);
                }
            }
        };

        loadPagefind();

        return () => {
            cancelled = true;
        };
    }, [searchOpen]);

    const handleSearchChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const nextQuery = event.target.value;
        setSearchQuery(nextQuery);

        const trimmedQuery = nextQuery.trim();
        searchRequestRef.current += 1;
        const requestId = searchRequestRef.current;

        if (!trimmedQuery) {
            setSearchResults([]);
            setSearchLoading(false);
            setSearchError(null);
            return;
        }

        const pagefind = pagefindRef.current;
        if (!pagefind) {
            setSearchResults([]);
            setSearchLoading(false);
            setSearchError(import.meta.env.DEV ? DEV_SEARCH_MESSAGE : 'Loading search index...');
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const response = await pagefind.search(trimmedQuery);
            const hydratedResults = await Promise.all(
                response.results.slice(0, SEARCH_RESULT_LIMIT).map(async (result) => {
                    const data = await result.data();

                    return {
                        url: data.url,
                        title:
                            data.meta?.title?.trim() ||
                            data.url.replace(/^\/docs\//, '').replace(/[\/-]/g, ' ').trim(),
                        excerpt: (data.excerpt ?? '').replace(/<[^>]*>/g, '').trim(),
                    };
                }),
            );

            if (searchRequestRef.current !== requestId) return;

            setSearchResults(hydratedResults);
            setSearchLoading(false);
        } catch {
            if (searchRequestRef.current !== requestId) return;

            setSearchResults([]);
            setSearchLoading(false);
            setSearchError('Search failed. Please try again.');
        }
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/docs/installation', label: 'Get started' },
        { href: '/docs', label: 'Docs' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return currentPath === '/';
        if (href === '/docs/installation') {
            return currentPath === '/docs/installation' || currentPath === '/docs/installation/';
        }
        if (href === '/docs') {
            return currentPath.startsWith('/docs') && !currentPath.startsWith('/docs/installation');
        }
        return currentPath.startsWith(href);
    };

    return (
        <>
            {/* ── Navbar ── */}
            <nav
                className="navbar-float"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="navbar-inner">
                    {/* Logo */}
                    <a href="/" className="navbar-logo" aria-label="Raven home">
                        <img
                            src="/raven-logo-dark.png"
                            alt="Raven"
                            width={124}
                            height={24}
                        />
                    </a>

                    {/* Desktop links */}
                    <div className="navbar-links" aria-label="Site links">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className={`navbar-link${isActive(link.href) ? ' active' : ''}`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar-actions">
                        {/* Search trigger */}
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Search docs (⌘K)"
                            title="Search (⌘K)"
                        >
                            <Search size={15} />
                        </button>

                        {/* GitHub */}
                        <a
                            href="https://github.com/rvnhq/raven"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            aria-label="View on GitHub"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        </a>

                        {/* Mobile menu toggle */}
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle mobile menu"
                            style={{ display: 'none' }} // shown via CSS on mobile
                        >
                            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Search Modal ── */}
            {searchOpen && (
                <div
                    className="search-overlay"
                    onClick={(e) => e.target === e.currentTarget && closeSearch()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search"
                >
                    <div className="search-modal">
                        <div className="search-input-wrapper">
                            <Search size={16} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search documentation..."
                                autoFocus
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="search-results">
                            {searchQuery.trim().length === 0 && (
                                <p className="search-empty">Start typing to search the docs.</p>
                            )}

                            {searchQuery.trim().length > 0 && searchLoading && (
                                <p className="search-empty">Searching docs...</p>
                            )}

                            {searchQuery.trim().length > 0 && !searchLoading && searchError && (
                                <p className="search-empty">{searchError}</p>
                            )}

                            {searchQuery.trim().length > 0 && !searchLoading && !searchError && searchResults.length === 0 && (
                                <p className="search-empty">No matching docs found.</p>
                            )}

                            {searchQuery.trim().length > 0 && !searchLoading && !searchError && searchResults.length > 0 && (
                                <div className="search-result-list">
                                    {searchResults.map((result) => (
                                        <a
                                            key={result.url}
                                            href={result.url}
                                            className="search-result-link"
                                            onClick={closeSearch}
                                        >
                                            <span className="search-result-title">{result.title}</span>
                                            {result.excerpt && (
                                                <span className="search-result-excerpt">{result.excerpt}</span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="search-footer">
                            <span className="search-hint">
                                <kbd>esc</kbd> to close
                            </span>
                            <span className="search-hint">
                                <kbd>↑</kbd><kbd>↓</kbd> to navigate
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
