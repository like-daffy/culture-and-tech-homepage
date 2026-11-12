// Unit tests run cultureand.tech's code, where Next.js writes false for __CLEAN_SPACE_APP_SITE__ (next.config.mjs,
// compiler.define; src/clean-space-app-site.d.ts). A test of clean-space.app's build sets it to true and back.
(globalThis as unknown as { __CLEAN_SPACE_APP_SITE__: boolean }).__CLEAN_SPACE_APP_SITE__ = false;
