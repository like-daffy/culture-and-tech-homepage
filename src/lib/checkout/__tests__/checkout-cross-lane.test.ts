import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkout } from "@/components/checkout/CheckoutPage";
import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";
import { CHECKOUT_COPY } from "../copy";
import { ALL_IN_ONE_AFTER_DELETION, ALL_IN_ONE_COPY } from "../product-copy";
import { paidOrder, saveHold } from "../session";
import type { ConfirmPaymentResponse, Lang } from "../contract";
import type { OpenProduct } from "../products";

type Hooks = { cursor: number; slots: unknown[]; effects: Array<() => unknown> };
const mocks = vi.hoisted(() => ({
  hooks: null as Hooks | null,
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
  createCheckoutOrder: mocks.order,
  confirmCheckoutPayment: mocks.confirm,
}));
vi.mock("../toss", async (importOriginal) => ({
  ...await importOriginal<typeof import("../toss")>(),
  renderPaymentWidget: mocks.widget,
}));

type View = ReactElement<{ children?: ReactNode; onClick?: () => void }>;
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
  origin: "https://example.invalid", pages: { en: {}, ko: {} }, footerPages: [], startPage: "account",
  firebase: { apiKey: "public-fixture", projectId: "fixture", appId: "fixture" }, recaptchaSiteKey: "fixture",
} as unknown as OpenProduct;
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

  it(`keeps the ${lang} normal LIVE receipt free of review and TEST lines`, async () => {
    for (const html of await receiptOnConfirmAndReload(lang, { ...preLaunchReview, environment: "live", review: undefined })) {
      expect(html).toContain(ALL_IN_ONE_COPY[lang].successBody.replaceAll("&", "&amp;"));
      expect(html).toContain('data-pass-term=""');
      expect(html).not.toContain(row7a[lang]);
      expect(html).not.toContain(`<p>${CHECKOUT_COPY[lang].reviewReceipt}</p>`);
      expect(html).not.toContain('data-pass-term="test"');
    }
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
    product: "fixture", lang, orderName: "fixture", expiresAt: pass.end, receiptEmail, options: [option],
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
