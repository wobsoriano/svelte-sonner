// Client-only so query params drive the page and `toast()` calls made during
// component init exercise the real pre-mount path in the browser.
export const ssr = false;
export const prerender = false;
