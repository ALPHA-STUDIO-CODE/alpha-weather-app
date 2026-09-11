import { useEffect, useRef, useState } from "react";
import { geocode } from "../apiClient.js";
import { debounce } from "../lib/debounce.js";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 5;

// A stable, shared empty-array reference. Returning a fresh `[]`
// literal from this hook on every render (for the "below MIN_CHARS"
// case) would give consumers a new array identity every single
// render, breaking any downstream `suggestions !== previous` check
// (e.g. SearchForm resetting highlightedIndex when the list changes)
// — that comparison would always be true, causing an infinite
// render loop. One shared reference fixes it.
const EMPTY_SUGGESTIONS = [];

/**
 * Fetches up to 5 city-geocode suggestions for `query`, debounced by
 * the already-ported debounce.js (Step 4) — not reimplemented here.
 *
 * Mirrors v1's fetchSuggestions / debouncedFetchSuggestions / input
 * listener trio (script.js) directly:
 * - Queries under MIN_CHARS (2) clear suggestions immediately and
 *   never reach the debounced function at all — matching v1's early
 *   `return` before `debouncedFetchSuggestions` is ever called, not
 *   a debounced-then-empty result.
 * - A failed geocode call clears suggestions rather than throwing,
 *   matching v1's `catch { hideSuggestions(); }`.
 * - The debounced function is created once (via useRef) and reused
 *   across renders, matching v1's single module-level
 *   `debouncedFetchSuggestions` — a fresh debounce() per render would
 *   reset the pending timer's closure every keystroke and defeat the
 *   whole point of debouncing.
 *
 * This hook only owns the fetch + state; Step 19 builds the dropdown
 * UI, highlight state, and keyboard navigation on top of the
 * `suggestions` this returns.
 */
export function useAutocomplete(query) {
  const [suggestions, setSuggestions] = useState([]);
  const debouncedFetchRef = useRef(null);
  if (debouncedFetchRef.current === null) {
    debouncedFetchRef.current = debounce(async (q) => {
      try {
        const results = await geocode(q);
        setSuggestions(results.slice(0, MAX_SUGGESTIONS));
      } catch {
        setSuggestions([]);
      }
    }, DEBOUNCE_MS);
  }

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS) {
      return;
    }
    debouncedFetchRef.current(trimmed);
  }, [query]);

  // Derived directly from `query` during render rather than via a
  // synchronous setState(...) inside the effect above (which oxlint's
  // react-hooks rules correctly flag as unnecessary — "Derive the
  // value during render" is exactly what this is). Functionally
  // identical to the original approach: a query under MIN_CHARS
  // still clears suggestions immediately, without waiting on the
  // debounce, same as v1's early return before
  // debouncedFetchSuggestions is ever called.
  const trimmedQuery = query.trim();
  return trimmedQuery.length < MIN_CHARS ? EMPTY_SUGGESTIONS : suggestions;
}
