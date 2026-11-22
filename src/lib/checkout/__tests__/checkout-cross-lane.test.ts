import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkout, CheckoutPage } from "@/components/checkout/CheckoutPage";
import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";
import { parseCreateCheckoutOrder } from "@/lib/clean-space/contract.generated";
import { CHECKOUT_COPY } from "../copy";
import { ALL_IN_ONE_AFTER_DELETION, ALL_IN_ONE_COPY, CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY } from "../product-copy";
import { paidOrder, saveHold } from "../session";
import type { ConfirmPaymentResponse, Lang, OfferVersions, OpenCheckoutResponse } from "../contract";
import { productUrl, type OpenProduct } from "../products";

type Hooks = { cursor: number; slots: unknown[]; effects: Array<() => unknown> };
const mocks = vi.hoisted(() => ({
  hooks: null as Hooks | null,
  open: vi.fn(),
  order: vi.fn(),
  confirm: vi.fn(),
  widget: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState(initial: unknown) {
      const hooks = mocks.hooks;
      if (!hooks) return react.useState(initial);
      const i = hooks.cursor++;
      if (!(i in hooks.slots)) hooks.slots[i] = typeof initial === "function" ? initial() : initial;
      return [hooks.slots[i], (value: unknown) => { hooks.slots[i] = value; }];
    },
    useRef(initial: unknown) {
      const hooks = mocks.hooks;
      if (!hooks) return react.useRef(initial);
      const i = hooks.cursor++;
      return hooks.slots[i] ??= { current: initial };
    },
    useEffect(effect: () => unknown) {
      if (mocks.hooks) mocks.hooks.effects.push(effect);
      else react.useEffect(effect as () => void);
    },
  };
});

vi.mock("../api", async (importOriginal) => ({
  ...await importOriginal<typeof import("../api")>(),
  openCheckout: mocks.open,
  createCheckoutOrder: mocks.order,
  confirmCheckoutPayment: mocks.confirm,
}));
vi.mock("../toss", async (importOriginal) => ({
  ...await importOriginal<typeof import("../toss")>(),
  renderPaymentWidget: mocks.widget,
}));

type View = ReactElement<{
  children?: ReactNode;
  onClick?: () => void;
  type?: string;
  onChange?: (event: { target: { checked: boolean } }) => void;
}>;
function mount<P>(node: ReactElement<P>) {
  if (typeof node.type !== "function") throw new Error("Expected an actual checkout component");
  const view = node.type as (props: P) => ReactNode;
  const hooks: Hooks = { cursor: 0, slots: [], effects: [] };
  return () => {
    mocks.hooks = hooks;
    hooks.cursor = 0;
    let result: ReactNode;
    try { result = view(node.props); } finally { mocks.hooks = null; }
    for (const effect of hooks.effects.splice(0)) effect();
    return result;
  };
}
function nodes(node: ReactNode): View[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  return isValidElement<View["props"]>(node) ? [node, ...nodes(node.props.children)] : [];
}

const product = {
  slug: "all-in-one", enabled: true, copy: ALL_IN_ONE_COPY, storageKey: "bundle-fixture",
  origin: "https://portal.cultureand.tech", pages: { terms: "terms", refund: "refund", privacy: "privacy" }, footerPages: ["terms", "refund", "privacy"], startPage: "account",
  firebase: { apiKey: "public-fixture", projectId: "fixture", appId: "fixture" }, recaptchaSiteKey: "fixture",
} as unknown as OpenProduct;
const bundleVersions = {
  prior: {
    termsVersion: "terms-6d509c3ba8a0533291667570b4a90238f2aae6a3f094c8c06dfd959520de80c9",
    refundPolicyVersion: "refunds-e7d429a08df19cf49bede77684aeb82670757154d414905b7222332f5f76a1c3",
  },
  published: {
    termsVersion: "terms-b65669e4a687ae6a6d04b60c057419bfa55f459e4f419ff20d2a1d1811c41515",
    refundPolicyVersion: "refunds-24123442be13355910d68b7307b94c41c2654aa09af7ca5d011f3680003164a9",
  },
};
const cleanSpaceVersions = {
  prior: {
    termsVersion: "2026-11-10-705b9411bb55", refundPolicyVersion: "2026-11-10-8b6b7b622d43",
    privacyPolicyVersion: "2026-11-10-d34cf0a5e3a3",
  },
  published: {
    termsVersion: "2026-11-23.7c994dc70ccb", refundPolicyVersion: "2026-11-23.5cb47964694c",
    privacyPolicyVersion: "2026-11-23.e0e48c8570dc",
  },
};
const cleanSpace: OpenProduct = {
  ...product, slug: "clean-space", copy: CLEAN_SPACE_COPY, storageKey: "clean-space-fixture",
  origin: "https://cultureand.tech",
  pages: {
    terms: "/culture/clean-space/direct-terms.html",
    refund: "/culture/clean-space/direct-refunds.html",
    privacy: "/culture/clean-space/direct-privacy.html",
  },
};
const credential = { checkoutId: "i".repeat(22), checkoutKey: "k".repeat(43) };
const receiptUrl = "https://example.invalid/receipt";
const pass = { start: "2026-12-12T14:00:00Z", end: "2027-12-11T14:00:00Z" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_CHECKOUT_POST_LAUNCH_REVIEW_COPY", undefined);
  const records = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (name: string) => records.get(name) ?? null,
      setItem: (name: string, value: string) => records.set(name, value),
      removeItem: (name: string) => records.delete(name),
    },
    location: { href: "https://example.invalid/checkout/all-in-one/success/", search: "?orderId=fixture-order&paymentKey=fixture&amount=100", reload: vi.fn() },
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function receiptOnConfirmAndReload(lang: Lang, answer: ConfirmPaymentResponse): Promise<string[]> {
  mocks.confirm.mockResolvedValue(answer);
  saveHold(product, credential);
  const fresh = mount(CheckoutSuccess({ product, lang }) as View);
  fresh();
  await Promise.resolve();
  const freshHtml = renderToStaticMarkup(fresh());
  const reload = mount(CheckoutSuccess({ product, lang }) as View);
  reload();
  expect(mocks.confirm).toHaveBeenCalledTimes(1);
  return [freshHtml, renderToStaticMarkup(reload())];
}

it.each(["en", "ko"] as const)("renders a settled All-in-one deletion as refund follow-up in %s, fresh and cached", async (lang) => {
  const answer: ConfirmPaymentResponse = {
    status: "PAID", orderId: "fixture-order", approvedAt: pass.start,
    method: null, environment: "live", receiptUrl, receiptEmail: null, afterDeletion: true, pass,
  };
  for (const html of await receiptOnConfirmAndReload(lang, answer)) {
    expect(html).toContain(ALL_IN_ONE_AFTER_DELETION[lang].noPass);
    expect(html).toContain(ALL_IN_ONE_AFTER_DELETION[lang].refund);
    expect(html).toContain("fixture-order");
    expect(html).toContain(receiptUrl);
    expect(html).not.toContain(ALL_IN_ONE_COPY[lang].successBody);
    expect(html).not.toContain("data-pass-term");
  }
  expect(paidOrder(product)).toMatchObject({ orderId: "fixture-order", pass: null, afterDeletion: true, receiptUrl });
  window.sessionStorage.setItem("bundle-fixture.paid", "other-order");
  expect(paidOrder(product)?.afterDeletion).toBeUndefined();
});

const row7a = {
  en: "Review test payment only — nothing was charged, and no paid pass is granted.",
  ko: "심사용 테스트 결제입니다 — 실제 금액은 청구되지 않으며 유료 이용권은 부여되지 않습니다.",
};
const preLaunchReview: ConfirmPaymentResponse = {
  status: "PAID", orderId: "fixture-order", approvedAt: pass.start, method: null,
  environment: "test", review: true, receiptUrl, receiptEmail: null, pass,
};

for (const lang of ["en", "ko"] as const) {
  it(`keeps the ${lang} pre-launch review receipt and its TEST term on reload`, async () => {
    for (const html of await receiptOnConfirmAndReload(lang, preLaunchReview)) {
      expect(html).toContain(`<p>${CHECKOUT_COPY[lang].reviewReceipt}</p>`);
      expect(html).toContain('data-pass-term="test"');
      expect(html).not.toContain(row7a[lang]);
    }
  });

  it.each([
    { postLaunchReview: true },
    { pass: { start: pass.start, end: pass.start } },
    { pass: { start: pass.start, end: "2026-12-12T13:59:59Z" } },
  ] as const)(`renders the exact ${lang} Row 7A on confirmation and reload for %j`, async (mark) => {
    for (const html of await receiptOnConfirmAndReload(lang, { ...preLaunchReview, ...mark })) {
      expect(html).toContain(`<p>${row7a[lang]}</p>`);
      expect(html).not.toContain(`<p>${CHECKOUT_COPY[lang].reviewReceipt}</p>`);
      expect(html).not.toContain('data-pass-term="test"');
    }
  });

  it(`shows the ${lang} normal LIVE term on fresh confirmation and labels an unrefreshed reload historical`, async () => {
    const [fresh, cached] = await receiptOnConfirmAndReload(lang, { ...preLaunchReview, environment: "live", review: undefined });
    const copy = CHECKOUT_COPY[lang];
    const successBody = ALL_IN_ONE_COPY[lang].successBody.replaceAll("&", "&amp;");
    expect(fresh).toContain(successBody);
    expect(fresh).toContain('data-pass-term=""');
    expect(cached).toContain(copy.historicalTitle);
    expect(cached).toContain(copy.historicalBody);
    expect(cached).toContain(copy.seeAccount);
    expect(cached).toContain("fixture-order");
    expect(cached).not.toContain(successBody);
    expect(cached).not.toContain("data-pass-term");
    for (const html of [fresh, cached]) {
      expect(html).not.toContain(row7a[lang]);
      expect(html).not.toContain(`<p>${CHECKOUT_COPY[lang].reviewReceipt}</p>`);
      expect(html).not.toContain('data-pass-term="test"');
    }
  });

  it.each([receiptUrl, "javascript:alert(1)"])(`shows the ${lang} refund on fresh confirmation and same-order reload with receipt %s`, async (url) => {
    const copy = CHECKOUT_COPY[lang];
    const html = await receiptOnConfirmAndReload(lang, {
      ...preLaunchReview, environment: "live", review: undefined, refunded: true, afterDeletion: true, pass: undefined, receiptUrl: url,
    });
    for (const result of html) {
      expect(result).toContain(copy.refundedTitle);
      expect(result).toContain(copy.refundedBody);
      expect(result).toContain(copy.seeAccount);
      expect(result).toContain("fixture-order");
      expect(result.includes(url)).toBe(url === receiptUrl);
      expect(result).not.toContain(copy.historicalTitle);
      expect(result).not.toContain(ALL_IN_ONE_AFTER_DELETION[lang].refund);
      expect(result).not.toContain(ALL_IN_ONE_COPY[lang].successBody.replaceAll("&", "&amp;"));
      expect(result).not.toContain("data-pass-term");
    }
    expect(paidOrder(product)).toMatchObject({ orderId: "fixture-order", refunded: true, pass: null, receiptUrl: url === receiptUrl ? url : null });
  });
}

it.each([
  ["test_fixture", "live", false],
  ["live_fixture", "test", false],
  ["live_fixture", "live", true],
  ["test_fixture", undefined, true],
] as const)("selected key %s and explicit environment %s agree before loading Toss: %s", async (clientKey, environment, loadsWidget) => {
  const lang: Lang = "en";
  const receiptEmail = "fixture@example.invalid";
  const option = { currency: "KRW" as const, price: 100, clientKey, test: false, variantKey: "fixture", agreementVariantKey: "fixture" };
  const checkout = mount(createElement(Checkout, { product, lang, credential, checkout: {
    product: "fixture", lang, orderName: "fixture", expiresAt: pass.end, receiptEmail, options: [option], ...bundleVersions.prior,
  } }));
  const payment = nodes(checkout()).find((n) => typeof n.type === "function" && n.type.name === "Payment");
  if (!payment) throw new Error("Expected payment component");
  const view = mount(payment);
  mocks.order.mockResolvedValue({ orderId: "fixture-order", orderName: "fixture", customerKey: "fixture",
    currency: "KRW", amount: 100, environment, receiptEmail });
  mocks.widget.mockReturnValue(new Promise(() => {}));
  const button = nodes(view()).find((n) => n.props.children === CHECKOUT_COPY.en.continue);
  button?.props.onClick?.();
  expect(mocks.order).toHaveBeenCalledTimes(1);
  await Promise.resolve();
  const second = nodes(view());
  if (loadsWidget) {
    expect(mocks.widget).toHaveBeenCalledWith(expect.objectContaining({ clientKey }));
  } else {
    expect(mocks.widget).not.toHaveBeenCalled();
    expect(second.some((n) => n.props.children === CHECKOUT_COPY.en.checkoutEnvironmentChanged)).toBe(true);
    const reload = second.find((n) => n.props.children === CHECKOUT_COPY.en.reloadCheckout);
    reload?.props.onClick?.();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  }
});

const reviewOption = {
  currency: "KRW" as const, price: 100, test: true, clientKey: "test_fixture", variantKey: "fixture", agreementVariantKey: "fixture",
};
const reviewer = (lang: Lang, versions: OfferVersions): OpenCheckoutResponse => ({
  ...versions, productVersion: "fixture-product", product: "fixture", lang, orderName: "fixture",
  expiresAt: pass.end, review: true, receiptEmail: null, options: [reviewOption],
});
const datedOffers = [
  { target: product, versions: bundleVersions },
  { target: cleanSpace, versions: cleanSpaceVersions },
];
const approvedLineStart = {
  en: "Full refund within the applicable seven-day period, even after use. After that, cancel during the original 364-day term",
  ko: "적용되는 7일 이내에는 이용했더라도 전액 환불됩니다. 이후에는 원래의 364일 이용 기간 중 해지하여",
};
const priorLine = {
  en: "Full refund on request within 7 days of payment.",
  ko: "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
};

function policyUrls(target: OpenProduct, lang: Lang, date: string) {
  if (target.slug === "clean-space") {
    const root = "https://cultureand.tech/culture/clean-space";
    return ["terms", "refunds", "privacy"].map((name) => `${root}/direct-${name}-${date}.html`);
  }
  const root = "https://portal.cultureand.tech" + (lang === "ko" ? "/ko" : "");
  return ["terms", "refund", "privacy"].map((name) => `${root}/${name}/${date}`);
}

async function openReviewerCheckout(target: OpenProduct, lang: Lang) {
  const page = mount(CheckoutPage({ product: target, lang }) as View);
  page();
  await Promise.resolve();
  const checkout = nodes(page()).find((node) => node.type === Checkout);
  if (!checkout) throw new Error("Expected an opened checkout");
  const checkoutView = mount(checkout);
  return {
    markup: () => renderToStaticMarkup(page()),
    agree: () => {
      const payment = nodes(checkoutView()).find((node) => typeof node.type === "function" && node.type.name === "Payment");
      if (!payment) throw new Error("Expected a payment component");
      const paymentView = mount(payment);
      const checks = nodes(paymentView()).filter((node) => node.type === "input" && node.props.type === "checkbox");
      expect(checks).toHaveLength(2);
      for (const check of checks) check.props.onChange?.({ target: { checked: true } });
      nodes(paymentView()).find((node) => node.props.children === CHECKOUT_COPY[lang].continue)?.props.onClick?.();
      return paymentView;
    },
  };
}

for (const { target, versions } of datedOffers) {
  for (const lang of ["en", "ko"] as const) {
    it.each(["BC", "KB"])("%s review stays bound through " + target.slug + " " + lang + " cutover and rollback", async () => {
      let offered: OfferVersions = versions.prior;
      mocks.open.mockImplementation(async () => reviewer(lang, offered));
      mocks.order.mockImplementation(async (_product: OpenProduct, consent: OfferVersions) => {
        if (consent.termsVersion !== offered.termsVersion || consent.refundPolicyVersion !== offered.refundPolicyVersion ||
            consent.privacyPolicyVersion !== offered.privacyPolicyVersion) {
          throw { code: "functions/failed-precondition", details: { code: "OFFER_CHANGED" } };
        }
        return {
          orderId: "fixture-order", orderName: "fixture", customerKey: "fixture", currency: "KRW", amount: 100,
          environment: "test", review: true, receiptEmail: null,
        };
      });
      mocks.widget.mockReturnValue(new Promise(() => {}));

      // The real entry consumes a synthetic fragment once. Reopening uses its saved tab credential.
      window.__checkoutHandoff = "#handoff=" + "i".repeat(22) + "." + "h".repeat(43);
      const open = () => openReviewerCheckout(target, lang);
      const assertPublished = (page: Awaited<ReturnType<typeof open>>, date: string) => {
        const markup = page.markup();
        const expected = policyUrls(target, lang, date);
        const anchors = [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
        expected.forEach((url, index) => expect(anchors.filter((href) => href === url)).toHaveLength(index === 2 ? 1 : 3));
        const other = date === "2026-11-10" ? "2026-11-23" : "2026-11-10";
        for (const url of policyUrls(target, lang, other)) expect(anchors).not.toContain(url);
        expect(markup).toContain(date === "2026-11-23" ? approvedLineStart[lang] : priorLine[lang]);
        expect(markup).not.toContain(date === "2026-11-23" ? priorLine[lang] : approvedLineStart[lang]);
        expect(markup).toContain(lang === "ko" ? "테스트 결제 모드입니다." : "This is Test payment mode.");
      };

      const before = await open();
      assertPublished(before, "2026-11-10");
      const held = mocks.open.mock.lastCall?.[1];
      expect(held).toMatchObject({ handoffCode: "h".repeat(43) });

      offered = versions.published;
      const changed = before.agree();
      await Promise.resolve();
      expect(mocks.order.mock.lastCall?.[1]).toMatchObject({ ...versions.prior, currency: "KRW", termsAccepted: true });
      expect(mocks.widget).not.toHaveBeenCalled();
      expect(renderToStaticMarkup(changed())).toContain(CHECKOUT_COPY[lang].offerChanged);
      nodes(changed()).find((node) => node.props.children === CHECKOUT_COPY[lang].reloadCheckout)?.props.onClick?.();
      expect(window.location.reload).toHaveBeenCalledTimes(1);
      const current = await open();
      assertPublished(current, "2026-11-23");
      expect(mocks.open.mock.lastCall?.[1]).toEqual({ checkoutId: held.checkoutId, checkoutKey: held.checkoutKey });

      // A fresh reviewer sees the same new policies and sends the exact versions to a KRW TEST order.
      window.__checkoutHandoff = "#handoff=" + "j".repeat(22) + "." + "r".repeat(43);
      const fresh = await open();
      assertPublished(fresh, "2026-11-23");
      const ready = fresh.agree();
      await Promise.resolve();
      ready();
      expect(mocks.order.mock.lastCall?.[1]).toMatchObject({ ...versions.published, currency: "KRW" });
      expect(mocks.widget).toHaveBeenCalledWith(expect.objectContaining({ clientKey: "test_fixture", review: true }));

      // Return to the first fixture tab, which has no order. Its session survives the consent rollback.
      saveHold(target, { checkoutId: held.checkoutId, checkoutKey: held.checkoutKey });
      offered = versions.prior;
      const rolledBack = current.agree();
      await Promise.resolve();
      nodes(rolledBack()).find((node) => node.props.children === CHECKOUT_COPY[lang].reloadCheckout)?.props.onClick?.();
      expect(window.location.reload).toHaveBeenCalledTimes(2);
      assertPublished(await open(), "2026-11-10");
      expect(mocks.open.mock.lastCall?.[1]).toEqual({ checkoutId: held.checkoutId, checkoutKey: held.checkoutKey });
    });

    it.each([
      { termsVersion: "unexpected" }, { termsVersion: undefined },
      { refundPolicyVersion: "unexpected" }, { refundPolicyVersion: undefined },
      { termsVersion: versions.prior.termsVersion }, { refundPolicyVersion: versions.prior.refundPolicyVersion },
    ])("blocks unknown " + target.slug + " " + lang + " versions %j", (invalid) => {
      const checkout = reviewer(lang, { ...versions.published, ...invalid });
      const html = renderToStaticMarkup(createElement(Checkout, { product: target, lang, checkout, credential }));
      expect(html).toContain(CHECKOUT_COPY[lang].termChanged);
      expect(html).not.toMatch(/<input|<a\b|<button/);
      expect(mocks.order).not.toHaveBeenCalled();
      expect(mocks.widget).not.toHaveBeenCalled();
    });
  }
}

it.each(["en", "ko"] as const)("keeps the Chord %s policy URLs, period anchor and no-notice summary", (lang) => {
  const chord = {
    ...product, slug: "chord-to-midi", copy: CHORD_TO_MIDI_COPY, origin: "https://chord-to-midi.app",
    pages: { terms: "terms", refund: "refund", privacy: "privacy" },
  } as OpenProduct;
  const html = renderToStaticMarkup(createElement(Checkout, { product: chord, lang, checkout: reviewer(lang, {}), credential }));
  const root = "https://chord-to-midi.app" + (lang === "ko" ? "/ko" : "");
  expect(html).toContain(`href="${root}/terms#${CHORD_TO_MIDI_COPY[lang].periodTerms?.anchor}"`);
  for (const name of ["terms", "refund"]) {
    expect(html.split(`href="${root}/${name}"`)).toHaveLength(3);
  }
  expect(html).toContain(priorLine[lang]);
  expect(html).not.toContain(approvedLineStart[lang]);
});

const priorDate = "2026-11-10";
const publishedDate = "2026-11-23";

it.each([
  { stage: "transition", edition: "prior", available: [priorDate] },
  { stage: "3b-before-IDs", edition: "prior", available: [priorDate, publishedDate] },
  { stage: "3c", edition: "published", available: [priorDate, publishedDate] },
  { stage: "post-publication-ui-containment", edition: "published", available: [priorDate, publishedDate] },
  { stage: "post-publication-prior-IDs", edition: "prior", available: [priorDate, publishedDate] },
  { stage: "pre-publication abort", edition: "prior", available: [priorDate] },
] as const)("keeps Terms, Refund and Privacy available in both locales at $stage", async ({ stage, edition, available }) => {
  const abort = stage === "pre-publication abort";
  if (abort) vi.setSystemTime(new Date("2026-11-23T10:00:00+09:00"));
  for (const { target, versions } of datedOffers) {
    for (const lang of ["en", "ko"] as const) {
      let offered: OfferVersions = versions[edition];
      const date = edition === "prior" ? priorDate : publishedDate;
      // The original Clean Space service omits this field before Stage 1. Only the old pair may omit it.
      if (stage === "transition" && target.slug === "clean-space" && lang === "ko") {
        offered = { ...offered, privacyPolicyVersion: undefined };
      }
      mocks.open.mockResolvedValue(reviewer(lang, offered));
      window.__checkoutHandoff = "#handoff=" + "i".repeat(22) + "." + "h".repeat(43);
      const openedAt = Date.now();
      const page = await openReviewerCheckout(target, lang);
      if (abort) {
        vi.setSystemTime(new Date(openedAt + 1_000));
        expect(Date.now() - openedAt).toBe(1_000);
      }

      const anchors = [...page.markup().matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
      const expected = policyUrls(target, lang, date);
      const served = available.flatMap((editionDate) => policyUrls(target, lang, editionDate));
      expect(expected.filter((url) => !served.includes(url))).toEqual([]);
      expected.forEach((url, index) => expect(anchors.filter((href) => href === url)).toHaveLength(index === 2 ? 1 : 3));
      for (const url of policyUrls(target, lang, date === priorDate ? publishedDate : priorDate)) {
        expect(anchors).not.toContain(url);
      }
      for (const item of ["terms", "refund", "privacy"] as const) {
        expect(anchors).not.toContain(productUrl(target, lang, item));
      }

      mocks.order.mockResolvedValue({
        orderId: "fixture-order", orderName: "fixture", customerKey: "fixture", currency: "KRW", amount: 100,
        environment: "test", review: true, receiptEmail: null,
      });
      page.agree();
      await Promise.resolve();
      const order = mocks.order.mock.lastCall?.[1];
      expect(order).toMatchObject({
        termsVersion: offered.termsVersion, refundPolicyVersion: offered.refundPolicyVersion, currency: "KRW",
      });
      if (target.slug === "clean-space") expect(parseCreateCheckoutOrder(order)).toEqual({ ok: true, value: order });
      if (offered.privacyPolicyVersion) {
        expect(order.privacyPolicyVersion).toBe(offered.privacyPolicyVersion);
      } else {
        expect(order).not.toHaveProperty("privacyPolicyVersion");
      }
    }
  }
});

it.each([
  { privacyPolicyVersion: undefined },
  { privacyPolicyVersion: "unexpected" },
  { privacyPolicyVersion: cleanSpaceVersions.prior.privacyPolicyVersion },
])("suppresses the Clean Space footer and payment on invalid November 23 privacy %j", async (invalid) => {
  for (const lang of ["en", "ko"] as const) {
    mocks.open.mockResolvedValue(reviewer(lang, { ...cleanSpaceVersions.published, ...invalid }));
    window.__checkoutHandoff = "#handoff=" + "i".repeat(22) + "." + "h".repeat(43);
    const html = (await openReviewerCheckout(cleanSpace, lang)).markup();
    expect(html).toContain(CHECKOUT_COPY[lang].termChanged);
    expect(html).not.toMatch(/<input|<button|direct-(terms|refunds|privacy)/);
    expect(mocks.order).not.toHaveBeenCalled();
    expect(mocks.widget).not.toHaveBeenCalled();
  }
});
