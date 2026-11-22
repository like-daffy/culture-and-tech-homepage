// Apply the dated amendment to the exported direct-sale documents. The public/ originals are the generated,
// previously published documents from mac-get-space. Keeping them intact also keeps the unset build byte-identical.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { REFUND_WINDOW, refundTime } from "../src/lib/refund-schedule.ts";

const text = JSON.parse(readFileSync(new URL("./lib/clean-space-refund-wording.json", import.meta.url), "utf8"));
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const paragraph = (s) => "<p>" + escape(s) + "</p>";

function requireReplace(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error("Expected Clean Space policy clause changed: " + label);
  return source.replace(pattern, replacement);
}

function amendedRefund(body, lang, contact) {
  const wording = text[lang];
  const headings = lang === "ko"
    ? ["전액 환불", "남은 이용 기간", "환불액 계산 기준", "이메일 요청 및 처리", "그 밖의 권리"]
    : ["Full refund", "Unused period", "When we calculate", "Email and processing", "Other rights"];
  const sections = wording.provisions.map((copy, index) =>
    "<section><h2>" + escape(headings[index]) + "</h2>" + paragraph(copy.replace("{contact}", contact)) + "</section>").join("");
  const headerEnd = body.indexOf("</header>");
  if (headerEnd < 0) throw new Error("Missing Clean Space policy header");
  const matching = [...body.matchAll(/<section\b[^>]*>\s*<h2[^>]*>(.*?)<\/h2>(.*?)<\/section>/gs)];
  if (matching.length !== 9) throw new Error("Unexpected Clean Space refund sections");
  const [,, protections,, timing,, after,, questions] = matching;
  const retainedTiming = requireReplace(timing[2], /^<ol>[\s\S]*?<\/ol>/, "", "processing protections");
  return body.slice(0, headerEnd + "</header>".length) + sections
    + "<section><h2>" + escape(protections[1]) + "</h2>"
    + requireReplace(protections[2], /<p>(A refund for a simple change of mind|단순 변심에 따른 환불)[\s\S]*?<\/p>/, "", "defect and mismatch protection")
    + retainedTiming + "</section>" + after[0]
    + "<section><h2>" + (lang === "ko" ? "Clean Space 탈퇴, 계정 삭제와 환불" : "Leaving Clean Space, account deletion and refunds") + "</h2>"
    + paragraph(wording.product)
    + paragraph(lang === "ko" ? "앱에서 로그아웃하거나 포털에서 앱 로그인을 끝내는 것도 환불 요청이 아닙니다." : "Signing out in the App or ending App Sign-ins on the Portal isn't a refund request either.")
    + "</section>" + questions[0];
}

function amendedTerms(body, lang) {
  const wording = text[lang];
  const ko = lang === "ko";
  body = requireReplace(body, ko
    ? /탈퇴는 환불 요청이 아니며, 결제한 날부터 7일 이내인 회원은 탈퇴하기 전에 환불을 요청할 수 있습니다\(제18조\)\./
    : /Leaving is not a refund request; members within 7 days of payment may request a refund before leaving \(Article 18\)\./,
  escape(wording.product), "Article 9 withdrawal");
  body = requireReplace(body, ko ? /<p>① 잠금 해제를 구매한 회원은.*?<\/p>/ : /<p>\(1\) A member who has bought the Unlock may withdraw.*?<\/p>/,
    paragraph((ko ? "① " : "(1) ") + wording.provisions[0]), "Article 18 withdrawal");
  body = requireReplace(body, ko ? /<p>④ 제1항의 기간이 지난 뒤에는 단순 변심.*?<\/p>/ : /<p>\(4\) After the period in paragraph \(1\), no refund is made.*?<\/p>/,
    paragraph((ko ? "④ " : "(4) ") + wording.provisions[4]), "Article 18 change of mind");
  const following = /(<section\b[^>]*><h2[^>]*>(?:Article 19\b|제19조))/;
  body = requireReplace(body, following,
    "<section><h2>" + (ko ? "제18조의2(남은 이용 기간의 해지)" : "Article 18-2 (Unused-period cancellation)") + "</h2>"
    + paragraph(wording.common) + "</section>$1", "Article 18-2");
  body = requireReplace(body, ko ? /<p>① 운영자는 청약철회나 환불 요청을 받은 날부터.*?<\/p>/ : /<p>\(1\) The Operator refunds the payment by cancelling it.*?<\/p>/,
    paragraph(ko
      ? "① 운영자는 청약철회를 접수한 날부터 3영업일 이내에 토스페이먼츠를 통해 결제를 취소하여 대금을 환급합니다. 남은 이용 기간의 해지 및 해당 계정 조치의 처리 기한은 제18조의2에 따릅니다."
      : "(1) The Operator cancels the payment through Toss Payments within 3 business days of receiving a withdrawal. Article 18-2 gives the deadline for unused-period cancellation and qualifying account events."),
    "Article 19 timing");
  return requireReplace(body, ko ? /환급은 결제한 통화로 전액 하며/ : /The refund is made in full in the currency of the payment/,
    ko ? "환급은 결제한 통화로 하며" : "The refund is made in the currency of the payment", "Article 19 currency");
}

export function exportRefundPolicyVersions(input, kind, window) {
  if (!window) return input;
  const contact = /href="mailto:([^"]+)"/.exec(input)?.[1];
  // The baseline is the canonical published export. No contact literal is maintained by this overlay.
  if (!contact || !/^[\w.+-]+@[\w.-]+$/.test(contact)) throw new Error("Missing published Clean Space support contact");
  let count = 0;
  const output = input.replace(/(<article id="(ko|en)" lang="(?:ko|en)">)([\s\S]*?)(<\/article>)/g, (_all, start, lang, body, end) => {
    count++;
    const published = refundTime(window.publishedAt, lang);
    const effective = refundTime(window.effectiveAt, lang);
    const updated = (kind === "terms" ? amendedTerms(body, lang) : amendedRefund(body, lang, contact))
      .replaceAll("2026-11-10", escape(effective)).replace(/ id="([^"]+)"/g, ' id="$1-amended"');
    const ko = lang === "ko";
    const prior = ko ? effective + " 시행 전 적용 문서" : "Version before " + effective;
    const next = ko ? effective + " 시행 문서" : "Version effective from " + effective;
    const notice = text[lang].notice.replace("{effective}", effective);
    const announcement = "https://portal.cultureand.tech" + (ko ? "/ko" : "") + "/refund-policy-update";
    const compare = ko ? "변경 전후 비교" : "Before and after";
    const rows = text[lang].comparison.map(([item, before, after]) =>
      '<tr><th scope="row">' + escape(item) + "</th><td>" + escape(before) + "</td><td>" + escape(after) + "</td></tr>").join("");
    const headings = [ko ? "항목" : "Item", ko ? "변경 전" : "Before", next];
    const table = "<table><caption>" + compare + "</caption><thead><tr>"
      + headings.map((heading) => '<th scope="col">' + escape(heading) + "</th>").join("")
      + "</tr></thead><tbody>" + rows + "</tbody></table>";
    // Plain HTML: both versions are dated, so old terms remain available and none is labeled current prematurely.
    return start + '<section aria-labelledby="' + lang + '-refund-notice"><h2 id="' + lang + '-refund-notice">'
      + (ko ? "환불정책 변경 안내" : "Refund policy update") + "</h2>"
      + paragraph(ko ? "공지 " + published + " · 시행 " + effective : "Publication " + published + " · Effective " + effective)
      + "<p>" + escape(notice) + ' <a href="' + announcement + '">' + escape(text[lang].link) + "</a></p>"
      + table + "<p>" + (ko ? "종전 주문에는 그 주문에 적용되는 약관과 법령상 권리가 유지됩니다." : "Earlier orders keep the terms that apply to them and all applicable statutory rights.") + "</p></section>"
      + '<details open><summary>' + escape(prior) + "</summary>" + body + "</details>"
      + '<details id="' + lang + '-amendment"><summary>' + escape(next) + "</summary>" + updated + "</details>" + end;
  });
  if (count !== 2) throw new Error("Expected both Clean Space policy locales");
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && REFUND_WINDOW && process.env.NEXT_PUBLIC_SITE !== "clean-space-app") {
  const out = fileURLToPath(new URL("../out/culture/clean-space/", import.meta.url));
  for (const [file, kind] of [["direct-terms.html", "terms"], ["direct-refunds.html", "refund"]]) {
    const path = join(out, file);
    writeFileSync(path, exportRefundPolicyVersions(readFileSync(path, "utf8"), kind, REFUND_WINDOW));
  }
}
