/**
 * A link to a place further down the same page (`#id`), such as the "Download" button after Clean Space's
 * introduction. On a plain click (or Enter) the page moves there smoothly, or at once for a visitor who asked for
 * reduced motion (`instant`, since the site's stylesheet makes every scroll smooth), with the target in the middle of
 * the window, clear of the fixed navigation; the keyboard focus then goes to the target, so keyboard and screen reader
 * users are on it. A click that opens a new tab or window, or a target that isn't on the page, is left to the browser.
 * Without JavaScript the link's own `#id` makes the jump (the target's scroll margin keeps it below the navigation).
 */

export interface JumpClick {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  preventDefault(): void;
}

export interface JumpTarget {
  scrollIntoView(options: ScrollIntoViewOptions): void;
  focus(options: FocusOptions): void;
}

export interface JumpPage {
  getElementById(id: string): JumpTarget | null;
  prefersReducedMotion(): boolean;
}

/** Moves the page to `target`; true when it did, false when the browser's own handling of the link was left alone */
export function jumpWithinPage(event: JumpClick, target: string, page: JumpPage): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const element = page.getElementById(target);
  if (!element) return false;
  event.preventDefault();
  element.scrollIntoView({ behavior: page.prefersReducedMotion() ? "instant" : "smooth", block: "center" });
  element.focus({ preventScroll: true });
  return true;
}

/** The page in the browser */
export function browserPage(): JumpPage {
  return {
    getElementById: (id) => document.getElementById(id),
    prefersReducedMotion: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}
