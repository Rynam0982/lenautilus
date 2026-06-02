"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, CalendarDays, MapPin } from "lucide-react";

type SearchResult = {
  slug: string;
  title: string;
  coverImage: string | null;
  startDate: string;
  categories: string[];
  venue: { name: string };
};

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Click outside closes
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    setResults([]);
    router.push(`/events?search=${encodeURIComponent(query.trim())}`);
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const showDropdown = open && focused && (loading || results.length > 0 || query.trim().length >= 2);

  return (
    <div ref={containerRef} className="relative">
      {/* Search icon button (collapsed) */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Rechercher"
          className="flex items-center justify-center h-9 w-9 rounded-full text-nautilus-gray hover:text-nautilus-white transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      )}

      {/* Expanded search input */}
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ width: 32, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 32, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <Search className="absolute left-3 h-4 w-4 text-nautilus-gray pointer-events-none shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              placeholder="Rechercher un événement…"
              className="h-9 w-full rounded-full border border-nautilus-border bg-nautilus-dark/80 pl-9 pr-8 text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none transition-colors"
            />
            {/* Right icon: loader / clear / close */}
            <div className="absolute right-2.5 flex items-center">
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 text-nautilus-gray animate-spin" />
              ) : query ? (
                <button type="button" onClick={clear} className="text-nautilus-gray hover:text-nautilus-white transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                  className="text-nautilus-gray hover:text-nautilus-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Dropdown results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 rounded-2xl border border-nautilus-border bg-nautilus-card shadow-2xl overflow-hidden z-50"
          >
            {loading && results.length === 0 ? (
              <div className="flex items-center justify-center py-8 gap-2 text-sm text-nautilus-gray">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recherche…
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-nautilus-gray">
                Aucun résultat pour <span className="text-nautilus-white">« {query} »</span>
              </div>
            ) : (
              <>
                <div className="divide-y divide-nautilus-border">
                  {results.map((event) => (
                    <Link
                      key={event.slug}
                      href={`/events/${event.slug}`}
                      onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-nautilus-dark/60 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-nautilus-border">
                        {event.coverImage ? (
                          <img src={event.coverImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-nautilus-gold/10">
                            <CalendarDays className="h-5 w-5 text-nautilus-gold/50" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-nautilus-white truncate group-hover:text-nautilus-gold transition-colors">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-nautilus-gray">
                            <CalendarDays className="h-3 w-3" />
                            {formatShortDate(event.startDate)}
                          </span>
                          <span className="text-nautilus-gray/30">·</span>
                          <span className="flex items-center gap-1 text-xs text-nautilus-gray truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {event.venue.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Footer: see all results */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setResults([]);
                    router.push(`/events?search=${encodeURIComponent(query.trim())}`);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 py-3 text-xs text-nautilus-gold hover:text-nautilus-gold-light transition-colors border-t border-nautilus-border"
                >
                  Voir tous les résultats pour « {query} »
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
