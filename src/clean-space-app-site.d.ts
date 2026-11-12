/**
 * true only in clean-space.app's build (NEXT_PUBLIC_SITE=clean-space-app), false in cultureand.tech's. Next.js replaces
 * it with the literal at compile time (next.config.mjs, compiler.define), so each `__CLEAN_SPACE_APP_SITE__ ? … : …`
 * compiles to its cultureand.tech branch alone there: write it at each use, never through a variable or an import, or
 * cultureand.tech's output changes. Unit tests set it on globalThis (vitest.setup.ts).
 */
declare const __CLEAN_SPACE_APP_SITE__: boolean;
