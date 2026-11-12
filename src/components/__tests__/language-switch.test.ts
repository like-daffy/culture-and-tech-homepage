import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageSwitch } from "@/components/LanguageSwitch";

// The language switch in the top navigation: on phones (below md) as wide as its content, so that "Culture & Tech"
// beside the logo keeps to one line at 390 px (measured in Chrome: HANDOVERS/2026-11-12/nav-logo-t1f); from md up the
// 150 px box it always was.
vi.mock("@/contexts/LanguageProvider", () => ({ useLanguage: () => ({ language: "en", setLanguage: () => {} }) }));

describe("the language switch", () => {
  it("fits its content on phones and keeps its 150 px box from md up", () => {
    const html = renderToStaticMarkup(createElement(LanguageSwitch));
    const trigger = /<button [^>]*role="combobox"[^>]*>/.exec(html)?.[0] ?? "";
    const classes = (/class="([^"]*)"/.exec(trigger)?.[1] ?? "").split(" ");
    for (const c of ["w-auto", "gap-1.5", "px-2", "md:w-[150px]", "md:gap-0", "md:px-3", "h-9"]) expect(classes).toContain(c);
    for (const c of ["w-full", "w-[150px]", "px-3"]) expect(classes).not.toContain(c);
    // The language icon keeps its space from md up; on phones the gap spaces it.
    const icon = /<svg [^>]*class="([^"]*lucide-languages[^"]*)"/.exec(html)?.[1].split(" ") ?? [];
    expect(icon).toContain("md:mr-2");
    expect(icon).not.toContain("mr-2");
  });
});
