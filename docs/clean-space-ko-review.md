# Clean Space: Korean text for the owner's review

Status: **all rows pending review** (written 2026-11-09 with the change that made Clean Space a product of the central
checkout). None of this Korean has been reviewed yet; until the owner approves it, treat every row as a draft. Fix a row
by editing its source (the key and file in the second column) and marking it here; never change reviewed Korean
elsewhere on the site for it.

Where the words come from:
- The terms are the direct sale's (mac-get-space `docs/13-direct-sale/facts.md`, the owner's decisions of 2026-11-09):
  "364일 잠금 해제" (the owner's Korean name), "이용 기간", "기본 기능" and "연락용 이메일" (never a sign-in or recovery
  address). App features use the app's reviewed Korean (mac-get-space `docs/localization/ko-strings.json`): 플러그인
  클리너, 관리자 도우미, 복구하기, 보고서; History is "기록" in this prose.
- The access period, price terms, refund and test-payment sentences follow Chord to MIDI's Toss-reviewed wording; rows
  whose words are exactly an already reviewed Korean text say so in the last column (checked against chord-to-midi-web's
  `src/i18n/ko.json` and this site's `src/lib/checkout/copy.ts`).
- Korean pages sell in won only (facts sheet), so the Korean product page and account page state the won price alone.

Not listed (unchanged): the page's existing reviewed Korean that the product page's website-edition section keeps as it
is ("파일은 Mac에서 처리합니다", "파일에 관한 정보를 어딘가로 보내나요?", "지금 받을 수 있나요?"), the checkout's own text
(`src/lib/checkout/copy.ts`, which also labels the account pages' footer), and the parts still English on `/ko/`: the
activation page and the account page's Macs section (`docs/clean-space-direct-sale.md`, "Korean text").

Rows 114–160 (added 2026-11-09, the owner's approval to draft them): the account page's sign-in, contact email, sign-in
methods and account deletion, and the sign-in callback page (`COPY.ko`).

Rows 161–197 (added 2026-11-09 with "Continue with email", the owner's decision of that day): the email sign-in in the
sign-in panel, the email link page (`/ko/apps/clean-space/auth/email/`) and the email method on the account page
(`COPY.ko`). They follow Chord to MIDI's reviewed `auth.email.*` and `auth.link.*` Korean where the meaning is the same
(the note says which key); rows marked "New" have no reviewed counterpart. Row 161 replaces row 122's wording.

When each row shows: the checkout rows (`CLEAN_SPACE_COPY`) only in a build that opens Clean Space's checkout, except
`backToProduct`, which the closed checkout pages show now; the product page rows (`COPY (product page)`) only with
`NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1`; the account page rows (`PURCHASE_COPY`) on `/ko/apps/clean-space/account/`
once the account pages are configured. `{name}` parts are filled in by the page.

| # | Key (file under `src/lib/`) | Korean | English | Status | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | `CLEAN_SPACE_TEST_PAYMENTS.ko.(testMode, testKeys)` (checkout/product-copy.ts) | 테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 테스트 결제로 받은 이용 기간은 정식 판매가 시작되면 끝납니다. | Test payment: payments run in Toss Payments' test environment for now, and nothing is actually charged. An access period received through a test payment ends when sales start for real. | pending review | Wording given in the brief (Chord to MIDI's test notice, adapted); the account page shows it too |
| 2 | `CLEAN_SPACE_COPY.ko.pageTitle` (checkout/product-copy.ts) | 결제: Clean Space 364일 잠금 해제 \| 컬처앤테크 | Checkout: Clean Space 364 days Unlock \| Culture & Tech | pending review |  |
| 3 | `CLEAN_SPACE_COPY.ko.productName` (checkout/product-copy.ts) | Clean Space — 364일 잠금 해제 | Clean Space — 364 days Unlock | pending review |  |
| 4 | `CLEAN_SPACE_COPY.ko.seller` (checkout/product-copy.ts) | Clean Space를 만드는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, 364일 잠금 해제는 Clean Space 계정에 적용됩니다. | Sold by Culture & Tech, which makes Clean Space. You pay here, on cultureand.tech, Culture & Tech's checkout; the 364 days Unlock applies to your Clean Space account. | pending review |  |
| 5 | `CLEAN_SPACE_COPY.ko.account` (checkout/product-copy.ts) | 연락용 이메일이 {email}인 Clean Space 계정에 적용됩니다. | For the Clean Space account whose contact email is {email}. | pending review |  |
| 6 | `CLEAN_SPACE_COPY.ko.receiptEmail` (checkout/product-copy.ts) | 영수증 및 연락용 이메일: {email} | Receipt and contact email: {email} | pending review |  |
| 7 | `CLEAN_SPACE_COPY.ko.notYou` (checkout/product-copy.ts) | 내 계정이 아닌가요? Clean Space 계정으로 돌아가기 | Not your account? Back to your Clean Space account | pending review |  |
| 8 | `CLEAN_SPACE_COPY.ko.lead` (checkout/product-copy.ts) | 한 번 결제하면 364일 동안, 이 계정으로 로그인한 Clean Space Mac 앱(웹사이트 버전)의 모든 기능을 쓸 수 있습니다. | One payment unlocks every feature of the Clean Space Mac app's website edition for 364 days, in the app signed in to your account. | pending review |  |
| 9 | `CLEAN_SPACE_COPY.ko.priceTerms` (checkout/product-copy.ts) | 자동으로 갱신되거나 다시 결제되지 않습니다. | It doesn't renew, and nothing is charged again. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 10 | `CLEAN_SPACE_COPY.ko.period` (checkout/product-copy.ts) | 이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. 정확한 시작과 만료 일시는 계정 페이지에 표시됩니다. | Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. Your account page shows the exact start and end. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 11 | `CLEAN_SPACE_COPY.ko.renewal` (checkout/product-copy.ts) | 이용 기간이 끝난 뒤에는 그때 표시되는 가격으로 직접 다시 구매할 수 있습니다. 다른 Mac에서 로그인하거나 앱을 다시 설치해도 이용 기간은 다시 시작되거나 늘어나지 않습니다. | After it ends, you can buy another 364 days yourself, at the price shown then. Signing in on another Mac or installing the app again never restarts or extends an access period. | pending review |  |
| 12 | `CLEAN_SPACE_COPY.ko.includes.[0]` (checkout/product-copy.ts) | 364일 동안 웹사이트 버전의 모든 기능을 쓸 수 있으며, 플러그인 클리너, Docker와 시뮬레이터 관리, 관리자 도우미, Spotlight 유지 관리도 포함됩니다. | Every feature of the website edition for 364 days, including Plugin Cleaner, Docker and simulator management, the administrator helper and Spotlight maintenance. | pending review |  |
| 13 | `CLEAN_SPACE_COPY.ko.includes.[1]` (checkout/product-copy.ts) | cultureand.tech에서 내려받은 웹사이트 버전에 적용되며, 이 계정으로 로그인한 모든 Mac에서 쓸 수 있습니다. Mac App Store 버전에는 적용되지 않습니다. | For the website edition downloaded from cultureand.tech, on every Mac signed in to this account. It doesn't unlock the Mac App Store app. | pending review |  |
| 14 | `CLEAN_SPACE_COPY.ko.includes.[2]` (checkout/product-copy.ts) | 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있고, 설정, 기록, 보고서, 복구하기도 그대로 남습니다. | When the access period ends, the basic features stay, and so do your settings, history, reports and Put Back. | pending review |  |
| 15 | `CLEAN_SPACE_COPY.ko.includes.[3]` (checkout/product-copy.ts) | 결제 후 7일 이내에 요청하면 전액 환불됩니다. | Full refund on request within 7 days of payment. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 16 | `CLEAN_SPACE_COPY.ko.currencyNotes.KRW` (checkout/product-copy.ts) | 국내 카드·간편결제로 결제, 부가세 포함 | For Korean cards and easy-pay services. VAT included. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 17 | `CLEAN_SPACE_COPY.ko.currencyNotes.USD` (checkout/product-copy.ts) | PayPal로 결제 | Pay with PayPal. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 18 | `CLEAN_SPACE_COPY.ko.salesClosed` (checkout/product-copy.ts) | 지금은 364일 잠금 해제를 판매하지 않습니다. 청구된 금액은 없습니다. | The 364 days Unlock isn't on sale now. Nothing was charged. | pending review |  |
| 19 | `CLEAN_SPACE_COPY.ko.already` (checkout/product-copy.ts) | 이 계정에는 이용 기간이 남은 364일 잠금 해제가 있습니다. 다음 이용 기간은 지금 기간이 끝난 뒤에 구매할 수 있습니다. | This account has the 364 days Unlock until its access period ends. Another can be bought after that. | pending review |  |
| 20 | `CLEAN_SPACE_COPY.ko.accountDeleted` (checkout/product-copy.ts) | 삭제 중인 계정이라 364일 잠금 해제를 구매할 수 없습니다. | This account is being deleted, so it cannot buy the 364 days Unlock. | pending review |  |
| 21 | `CLEAN_SPACE_COPY.ko.emailNotConfirmed` (checkout/product-copy.ts) | 결제하기 전에 Clean Space 계정의 연락용 이메일을 확인해 주세요. | Confirm the contact email of your Clean Space account before paying. | pending review |  |
| 22 | `CLEAN_SPACE_COPY.ko.accountUnavailable` (checkout/product-copy.ts) | 이 Clean Space 계정은 사용할 수 없습니다. | This Clean Space account is not available. | pending review |  |
| 23 | `CLEAN_SPACE_COPY.ko.noCheckout` (checkout/product-copy.ts) | Clean Space 계정 페이지에서 로그인한 뒤 결제 페이지로 이동해 주세요. | Start your purchase on your Clean Space account page: sign in there, then continue to the checkout. | pending review |  |
| 24 | `CLEAN_SPACE_COPY.ko.ended` (checkout/product-copy.ts) | 이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. Clean Space 계정 페이지에서 다시 시작해 주세요. | This checkout has ended, or was opened in another tab. Start again from your Clean Space account page. | pending review |  |
| 25 | `CLEAN_SPACE_COPY.ko.backToProduct` (checkout/product-copy.ts) | Clean Space로 돌아가기 | Back to Clean Space | pending review | Also products.ts CLEAN_SPACE_NAME.ko.backToProduct: shown on the closed checkout pages now |
| 26 | `CLEAN_SPACE_COPY.ko.successBody` (checkout/product-copy.ts) | 364일 잠금 해제가 364일 동안 계정에 적용됩니다. Mac의 Clean Space에서 이 계정으로 로그인하면 쓸 수 있습니다. | The 364 days Unlock is on your account for 364 days. Sign in to Clean Space on your Mac with this account to use it. | pending review |  |
| 27 | `CLEAN_SPACE_COPY.ko.passTerm` (checkout/product-copy.ts) | 364일 잠금 해제: {start}부터 {end}까지. 자동으로 갱신되지 않습니다. | 364 days Unlock: from {start} to {end}. It doesn't renew. | pending review |  |
| 28 | `CLEAN_SPACE_COPY.ko.alreadyOwned` (checkout/product-copy.ts) | 이 계정에는 아직 끝나지 않은 364일 잠금 해제 이용 기간이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다. | This account already has an access period of the 364 days Unlock that hasn't ended, so this payment was not made. Nothing was charged. | pending review |  |
| 29 | `CLEAN_SPACE_COPY.ko.accountDeletedResult` (checkout/product-copy.ts) | 결제를 확인하는 동안 계정이 삭제되어 364일 잠금 해제를 적용하지 못했습니다. | The account was deleted while the payment was being confirmed, so the 364 days Unlock could not be added to it. | pending review |  |
| 30 | `CLEAN_SPACE_COPY.ko.finishOnProduct` (checkout/product-copy.ts) | 이 탭에는 결제 정보가 남아 있지 않습니다. Clean Space 계정 페이지에서 결제한 계정으로 로그인하면 결제가 마무리됩니다. | This tab no longer holds the checkout. To finish the payment, sign in on your Clean Space account page to the account you paid with. | pending review |  |
| 31 | `CLEAN_SPACE_COPY.ko.finishButton` (checkout/product-copy.ts) | Clean Space 계정에서 마무리하기 | Finish on your Clean Space account | pending review |  |
| 32 | `PURCHASE_COPY.ko.heading` (clean-space/copy.ts) | 364일 잠금 해제 | 364 days Unlock | pending review |  |
| 33 | `PURCHASE_COPY.ko.none` (clean-space/copy.ts) | 이 계정에는 364일 잠금 해제가 없습니다. | This account has no 364 days Unlock. | pending review |  |
| 34 | `PURCHASE_COPY.ko.active` (clean-space/copy.ts) | 이용 기간: {start}부터 {end}까지 | Access period: from {start} until {end}. | pending review |  |
| 35 | `PURCHASE_COPY.ko.expired` (clean-space/copy.ts) | 이용 기간이 {end}에 끝났습니다. | The access period ended on {end}. | pending review |  |
| 36 | `PURCHASE_COPY.ko.revoked` (clean-space/copy.ts) | 환불 또는 취소로 이용 기간이 일찍 끝났습니다. | The access period ended early: refunded or cancelled. | pending review |  |
| 37 | `PURCHASE_COPY.ko.what` (clean-space/copy.ts) | 이 계정으로 로그인한 모든 Mac에서 Clean Space Mac 앱(웹사이트 버전)의 모든 기능을 쓸 수 있습니다. 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있습니다. | Every feature of the Clean Space Mac app's website edition, on every Mac signed in to this account. The basic features stay after the access period ends. | pending review |  |
| 38 | `PURCHASE_COPY.ko.priceKRW` (clean-space/copy.ts) | {price} (부가세 포함) | {price} (VAT included) | pending review |  |
| 39 | `PURCHASE_COPY.ko.priceUSD` (clean-space/copy.ts) | PayPal로 {price} | {price} with PayPal | pending review |  |
| 40 | `PURCHASE_COPY.ko.period` (clean-space/copy.ts) | 이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. | Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. | pending review | The first sentence of Chord to MIDI's reviewed period sentence |
| 41 | `PURCHASE_COPY.ko.renewal` (clean-space/copy.ts) | 자동으로 갱신되거나 다시 결제되지 않습니다. | It doesn't renew, and nothing is charged again. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 42 | `PURCHASE_COPY.ko.refund` (clean-space/copy.ts) | 결제 후 7일 이내에 요청하면 전액 환불됩니다. | Full refund on request within 7 days of payment. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 43 | `PURCHASE_COPY.ko.buy` (clean-space/copy.ts) | 364일 잠금 해제 구매하기 | Buy the 364 days Unlock | pending review |  |
| 44 | `PURCHASE_COPY.ko.buyAgain` (clean-space/copy.ts) | 364일 다시 구매하기 | Buy another 364 days | pending review |  |
| 45 | `PURCHASE_COPY.ko.opening` (clean-space/copy.ts) | 결제 페이지를 여는 중… | Opening the checkout… | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 46 | `PURCHASE_COPY.ko.checkoutNote` (clean-space/copy.ts) | 결제는 이 사이트(cultureand.tech)의 컬처앤테크 결제 페이지에서 토스페이먼츠로 진행됩니다. | You pay on Culture & Tech's checkout on this site (cultureand.tech), through Toss Payments. | pending review |  |
| 47 | `PURCHASE_COPY.ko.notOnSale` (clean-space/copy.ts) | 364일 잠금 해제는 아직 판매하지 않습니다. | The 364 days Unlock isn't on sale yet. | pending review |  |
| 48 | `PURCHASE_COPY.ko.salesPaused` (clean-space/copy.ts) | 지금은 364일 잠금 해제를 판매하지 않습니다. | The 364 days Unlock isn't on sale now. | pending review |  |
| 49 | `PURCHASE_COPY.ko.offerFailed` (clean-space/copy.ts) | 상품 정보를 불러오지 못했습니다. | The offer could not be loaded. | pending review |  |
| 50 | `PURCHASE_COPY.ko.contactFirst` (clean-space/copy.ts) | 구매하기 전에 아래에서 연락용 이메일을 확인해 주세요. | Confirm a contact email below before buying. | pending review |  |
| 51 | `PURCHASE_COPY.ko.deleting` (clean-space/copy.ts) | 삭제 중인 계정이라 364일 잠금 해제를 구매할 수 없습니다. | This account is being deleted, so it can't buy the 364 days Unlock. | pending review |  |
| 52 | `PURCHASE_COPY.ko.testPayments` (clean-space/copy.ts) | 테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 테스트 결제로 받은 이용 기간은 정식 판매가 시작되면 끝납니다. | Test payment: payments run in Toss Payments' test environment for now, and nothing is actually charged. An access period received through a test payment ends when sales start for real. | pending review | Wording given in the brief; the same as row 1 |
| 53 | `PURCHASE_COPY.ko.refusals.alreadyOwned` (clean-space/copy.ts) | 이 계정에는 이용 기간이 남은 364일 잠금 해제가 있습니다. 다음 이용 기간은 지금 기간이 끝난 뒤에 구매할 수 있습니다. | This account has the 364 days Unlock until its access period ends. Another can be bought after that. | pending review |  |
| 54 | `PURCHASE_COPY.ko.refusals.salesClosed` (clean-space/copy.ts) | 지금은 364일 잠금 해제를 판매하지 않습니다. 청구된 금액은 없습니다. | The 364 days Unlock isn't on sale now. Nothing was charged. | pending review |  |
| 55 | `PURCHASE_COPY.ko.refusals.currencyUnavailable` (clean-space/copy.ts) | 아직 결제를 받지 않습니다. | Purchases are not open yet. | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 56 | `PURCHASE_COPY.ko.refusals.accountDeleted` (clean-space/copy.ts) | 삭제 중인 계정이라 364일 잠금 해제를 구매할 수 없습니다. | This account is being deleted, so it can't buy the 364 days Unlock. | pending review |  |
| 57 | `PURCHASE_COPY.ko.refusals.accountUnavailable` (clean-space/copy.ts) | 이 Clean Space 계정은 사용할 수 없습니다. | This Clean Space account is not available. | pending review |  |
| 58 | `PURCHASE_COPY.ko.refusals.contactRequired` (clean-space/copy.ts) | 결제하기 전에 이 계정의 연락용 이메일을 확인해 주세요. | Confirm the contact email of this account before paying. | pending review |  |
| 59 | `PURCHASE_COPY.ko.refusals.inProgress` (clean-space/copy.ts) | 이 계정의 다른 결제가 아직 열려 있거나 확인 중입니다. 그 탭에서 마무리하거나 몇 분 뒤에 다시 시도해 주세요. | Another checkout of this account is still open or being confirmed. Finish it in its tab, or wait a few minutes and try again. | pending review |  |
| 60 | `PURCHASE_COPY.ko.refusals.tooMany` (clean-space/copy.ts) | 이 계정으로 시작한 결제가 너무 많습니다. 몇 분 뒤에 다시 시도해 주세요. | Too many checkouts were started for this account. Wait a few minutes, then try again. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 61 | `PURCHASE_COPY.ko.refusals.signInAgain` (clean-space/copy.ts) | 로그인이 만료되었습니다. 다시 로그인한 뒤 시도해 주세요. | Your sign-in has ended. Sign in again, then try again. | pending review |  |
| 62 | `PURCHASE_COPY.ko.failed` (clean-space/copy.ts) | 결제 페이지를 열지 못했습니다: {message} | The checkout could not open: {message} | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 63 | `PURCHASE_COPY.ko.badAddress` (clean-space/copy.ts) | 결제 페이지를 열지 못했습니다. 다시 시도해 보시고, 계속 안 되면 문의해 주세요. | The checkout could not be opened. Try again, or contact support if it keeps happening. | pending review |  |
| 64 | `PURCHASE_COPY.ko.purchasesHeading` (clean-space/copy.ts) | 구매 내역 | Purchases | pending review | Same words as Chord to MIDI's reviewed Korean |
| 65 | `PURCHASE_COPY.ko.purchasesNone` (clean-space/copy.ts) | 아직 구매 내역이 없습니다. | No purchases yet. | pending review | Same words as Chord to MIDI's reviewed Korean |
| 66 | `PURCHASE_COPY.ko.purchaseStatus.paid` (clean-space/copy.ts) | 결제 완료 | Paid | pending review | Same words as Chord to MIDI's reviewed Korean |
| 67 | `PURCHASE_COPY.ko.purchaseStatus.partially_refunded` (clean-space/copy.ts) | 부분 환불됨 | Partly refunded | pending review | Same words as Chord to MIDI's reviewed Korean |
| 68 | `PURCHASE_COPY.ko.purchaseStatus.refunded` (clean-space/copy.ts) | 환불됨 | Refunded | pending review | Same words as Chord to MIDI's reviewed Korean |
| 69 | `PURCHASE_COPY.ko.purchaseStatus.pending` (clean-space/copy.ts) | 기록 중 | Being recorded | pending review |  |
| 70 | `PURCHASE_COPY.ko.purchaseStatus.failed` (clean-space/copy.ts) | 실패 | Failed | pending review |  |
| 71 | `PURCHASE_COPY.ko.purchaseStatus.canceled` (clean-space/copy.ts) | 취소됨 | Cancelled | pending review |  |
| 72 | `PURCHASE_COPY.ko.purchasePeriod` (clean-space/copy.ts) | 이용 기간: {start}부터 {end}까지 | Access period: from {start} until {end}. | pending review |  |
| 73 | `PURCHASE_COPY.ko.purchaseMethod` (clean-space/copy.ts) | 결제 수단: {method} | Paid with {method} | pending review |  |
| 74 | `PURCHASE_COPY.ko.receiptLink` (clean-space/copy.ts) | 토스페이먼츠 영수증 | Toss Payments receipt | pending review |  |
| 75 | `PURCHASE_COPY.ko.refundRequest` (clean-space/copy.ts) | 환불 요청 | Request a refund | pending review | Same words as Chord to MIDI's reviewed Korean |
| 76 | `PURCHASE_COPY.ko.refundNote` (clean-space/copy.ts) | 결제 후 7일 이내에 요청하면 전액 환불됩니다. {refund}을 확인해 주세요. | Payments are refunded in full on request within 7 days; see the {refund}. | pending review | Same words as Chord to MIDI's reviewed Korean ({refund}: 환불정책, the checkout's label) |
| 77 | `PURCHASE_COPY.ko.refundSubject` (clean-space/copy.ts) | 환불 요청: {orderId} | Refund request: {orderId} | pending review | Same words as Chord to MIDI's reviewed Korean (the email's subject) |
| 78 | `PURCHASE_COPY.ko.refundBody` (clean-space/copy.ts) | 주문번호: {orderId}\n연락용 이메일: {email}\n사유(선택):  | Order: {orderId}\nContact email: {email}\nReason (optional):  | pending review | Chord to MIDI's reviewed email body, with 연락용 이메일 for 계정 (\n: a new line) |
| 79 | `PURCHASE_COPY.ko.resumeSignIn` (clean-space/copy.ts) | 결제를 마무리하려면 결제한 계정으로 로그인해 주세요. | Sign in with the account you paid with to finish your payment. | pending review |  |
| 80 | `PURCHASE_COPY.ko.resumeConfirming` (clean-space/copy.ts) | 결제를 마무리하는 중… | Finishing your payment… | pending review |  |
| 81 | `PURCHASE_COPY.ko.paidHeading` (clean-space/copy.ts) | 감사합니다! 구매가 완료되었습니다. | Thank you! Your purchase is complete. | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 82 | `PURCHASE_COPY.ko.paidBody` (clean-space/copy.ts) | 364일 잠금 해제가 {start}부터 {end}까지 계정에 적용됩니다. Mac에서 Clean Space를 열고 이 계정으로 로그인하면 쓸 수 있습니다. | The 364 days Unlock is on your account from {start} until {end}. Open Clean Space on your Mac and sign in with this account to use it. | pending review |  |
| 83 | `PURCHASE_COPY.ko.receipt` (clean-space/copy.ts) | 영수증 보기 | View the receipt | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 84 | `PURCHASE_COPY.ko.resumeRefusals.pending` (clean-space/copy.ts) | 토스페이먼츠가 결제를 승인했고, 기록을 아직 마무리하는 중입니다. 다시 결제하지 마세요. 기록되는 대로 이 페이지에 표시되며, 한 시간이 지나도 표시되지 않으면 문의해 주세요. | Toss Payments approved the payment, and recording it isn't finished yet. Don't pay again: it shows on this page as soon as it is recorded. If it hasn't within an hour, contact us. | pending review |  |
| 85 | `PURCHASE_COPY.ko.resumeRefusals.wrongAccount` (clean-space/copy.ts) | 이 결제는 다른 계정의 결제입니다. 로그아웃한 뒤 결제한 계정으로 로그인해 주세요. | This payment belongs to another account. Sign out, then sign in with the account you paid with. | pending review |  |
| 86 | `PURCHASE_COPY.ko.resumeRefusals.expired` (clean-space/copy.ts) | 결제를 마무리하는 데 시간이 너무 오래 걸렸습니다. 결제되었다면 자동으로 기록되어 이 페이지에 표시됩니다. | Finishing this payment took too long. If you were charged, the payment is recorded by itself and shows on this page. | pending review |  |
| 87 | `PURCHASE_COPY.ko.resumeRefusals.alreadyOwned` (clean-space/copy.ts) | 이 계정에는 아직 끝나지 않은 364일 잠금 해제 이용 기간이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다. | This account already has an access period of the 364 days Unlock that hasn't ended, so this payment was not made. Nothing was charged. | pending review |  |
| 88 | `PURCHASE_COPY.ko.resumeRefusals.accountDeleted` (clean-space/copy.ts) | 결제를 확인하는 동안 계정이 삭제되어 364일 잠금 해제를 적용하지 못했습니다. | The account was deleted while the payment was being confirmed, so the 364 days Unlock could not be added to it. | pending review |  |
| 89 | `PURCHASE_COPY.ko.resumeRefusals.inProgress` (clean-space/copy.ts) | 이 계정의 다른 결제를 아직 확인하고 있습니다. 몇 분 뒤에 '다시 시도'를 눌러 주세요. | Another payment of this account is still being confirmed. Wait a few minutes, then press Try again. | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 90 | `PURCHASE_COPY.ko.resumeFailed` (clean-space/copy.ts) | 결제를 확인하지 못했습니다: {message} | We could not confirm the payment: {message} | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 91 | `PURCHASE_COPY.ko.ifCharged` (clean-space/copy.ts) | 결제가 되었는데 해결되지 않으면 {email}로 문의해 주세요. | If you were charged and this doesn't resolve, contact {email}. | pending review |  |
| 92 | `PURCHASE_COPY.ko.badResume` (clean-space/copy.ts) | 결제를 마무리하는 링크가 올바르지 않습니다. 결제되었다면 기록되는 대로 이 페이지에 표시됩니다. | This link to finish a payment isn't valid. If you were charged, the payment shows on this page once it is recorded. | pending review |  |
| 93 | `PURCHASE_COPY.ko.tryAgain` (clean-space/copy.ts) | 다시 시도 | Try again | pending review | Same words as the checkout's reviewed Korean (src/lib/checkout/copy.ts) |
| 94 | `PURCHASE_COPY.ko.accountChanged` (clean-space/copy.ts) | 진행하는 동안 다른 계정으로 로그인해서 그 결과는 쓰지 않았습니다. 다시 시도해 주세요. | You signed in to another account while this was in progress, so its answer was not used. Try again. | pending review |  |
| 95 | `COPY (product page).ko.title` (clean-space/channel-copy.ts) | 웹사이트 버전과 364일 잠금 해제 | The website edition and the 364 days Unlock | pending review |  |
| 96 | `COPY (product page).ko.intro` (clean-space/channel-copy.ts) | Clean Space는 이 사이트에서도 내려받을 수 있습니다. 컬처앤테크의 Apple Developer ID로 서명하고 Apple의 공증을 받은 앱이며, macOS 14 이상(Apple silicon 또는 Intel)에서 쓸 수 있습니다. 무료로 내려받아 기본 기능을 쓸 수 있고, 유료 옵션인 364일 잠금 해제로 모든 기능을 쓸 수 있습니다. | Clean Space also comes as a download from this site, signed with our Apple Developer ID and notarized by Apple, for macOS 14 or later (Apple silicon or Intel). It is free to download and use with its basic features, and one paid option, the 364 days Unlock, unlocks every feature. | pending review |  |
| 97 | `COPY (product page).ko.basicTitle` (clean-space/channel-copy.ts) | 기본 기능 (무료) | Basic features, free | pending review |  |
| 98 | `COPY (product page).ko.basicText` (clean-space/channel-copy.ts) | 캐시, 설치 파일, 개발 캐시를 검토해 휴지통으로 옮기고, 모든 확인을 거쳐 휴지통을 비울 수 있습니다. 기록, 보고서, 예외, 설정, 복구하기와 모든 안전 규칙도 포함됩니다. | Review caches, installers and development caches and move them to the Trash, and empty the Trash with every check. History, reports, exclusions, settings and Put Back are included, and so are all the safety rules. | pending review |  |
| 99 | `COPY (product page).ko.unlockTitle` (clean-space/channel-copy.ts) | 364일 잠금 해제로 쓸 수 있는 기능 | With the 364 days Unlock | pending review |  |
| 100 | `COPY (product page).ko.unlockText` (clean-space/channel-copy.ts) | 모든 기능: 앱에서 잠금 해제가 필요하다고 표시하는 항목, 심층 검사, 중복 검증과 영구 삭제, 숨김 폴더 검토와 플러그인 클리너, Docker와 시뮬레이터 관리, 관리자 도우미와 Spotlight 유지 관리. | Every feature: the items the app marks as needing the Unlock, a deeper scan, duplicate verification and permanent removal, hidden-folder review and Plugin Cleaner, Docker and simulator management, the administrator helper and Spotlight maintenance. | pending review |  |
| 101 | `COPY (product page).ko.priceTitle` (clean-space/channel-copy.ts) | 가격과 이용 기간 | Price and access period | pending review |  |
| 102 | `COPY (product page).ko.priceText` (clean-space/channel-copy.ts) | {krw}(부가세 포함). 이 사이트에서 Google, Kakao 또는 Naver로 로그인한 뒤 토스페이먼츠로 한 번 결제합니다. 이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. 자동으로 갱신되거나 다시 결제되지 않습니다. | {krw} (VAT included), or {usd} with PayPal: one payment on this site through Toss Payments, signed in with Google, Kakao or Naver. Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. It doesn't renew, and nothing is charged again. | pending review | {krw}: the won price, ₩3,300 |
| 103 | `COPY (product page).ko.refundTitle` (clean-space/channel-copy.ts) | 환불과 이용 기간이 끝난 뒤 | Refunds, and after the access period | pending review |  |
| 104 | `COPY (product page).ko.refundText` (clean-space/channel-copy.ts) | 결제 후 7일 이내에 요청하면 전액 환불됩니다. 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있고, 설정, 기록, 보고서, 복구하기도 그대로 남습니다. | Full refund on request within 7 days of payment. When the access period ends, the basic features stay, and so do your settings, history, reports and Put Back. | pending review |  |
| 105 | `COPY (product page).ko.note` (clean-space/channel-copy.ts) | 두 버전은 서로 다른 상품입니다. Mac App Store에서 구매한 Expert는 웹사이트 버전에 적용되지 않고, 364일 잠금 해제는 Mac App Store 버전에 적용되지 않습니다. | The two editions are separate products: Expert bought in the Mac App Store doesn't unlock the website edition, and the 364 days Unlock doesn't unlock the Mac App Store app. | pending review |  |
| 106 | `COPY (product page).ko.download` (clean-space/channel-copy.ts) | Mac용 다운로드 | Download for Mac | pending review |  |
| 107 | `COPY (product page).ko.buy` (clean-space/channel-copy.ts) | 364일 잠금 해제 구매하기 | Buy the 364 days Unlock | pending review |  |
| 108 | `COPY (product page).ko.policies` (clean-space/channel-copy.ts) | 구매하기 전에 웹사이트 버전의 {terms}, {refund}, {privacy}을 확인해 주세요. | The website edition's {terms}, {refund} and {privacy}: please read them before you buy. | pending review |  |
| 109 | `COPY (product page).ko.privacyItem.text` (clean-space/channel-copy.ts) | 파일과 검사 결과는 Mac에서 처리하며 개발자 서버로 업로드하지 않습니다. Mac App Store 버전에는 분석 도구도 계정도 없고, Expert 구매와 복원은 Apple이 처리합니다. 웹사이트 버전에도 분석 도구가 없으며, 계정은 364일 잠금 해제에만 쓰이고 파일 이름, 경로, 검사 결과는 보내지 않습니다. | Files and scan results are processed on your Mac and are not uploaded to our servers. The Mac App Store app has no analytics and no account; Apple handles Expert purchases and restores. The website edition has no analytics either: its account is only for the 364 days Unlock, and it sends no file names, paths or scan results. | pending review |  |
| 110 | `COPY (product page).ko.privacyFaq.answer` (clean-space/channel-copy.ts) | 아니요. 파일과 검사 결과는 Mac에서 처리하며 개발자 서버로 업로드하지 않습니다. Mac App Store 버전에는 계정이 없고, Expert 구매는 Apple이 처리합니다. 웹사이트 버전의 계정은 364일 잠금 해제에만 쓰이며, 이용 기간을 확인할 뿐 파일 이름, 경로, 검사 결과는 보내지 않습니다. | No. Files and scan results are processed on your Mac and are not uploaded to our servers. The Mac App Store app has no account, and Apple handles Expert purchases. The website edition's account is used only for the 364 days Unlock: it checks your access period and sends no file names, paths or scan results. | pending review |  |
| 111 | `COPY (product page).ko.unlockFaq.question` (clean-space/channel-copy.ts) | 364일 잠금 해제는 무엇인가요? | What is the 364 days Unlock? | pending review |  |
| 112 | `COPY (product page).ko.unlockFaq.answer` (clean-space/channel-copy.ts) | 이 사이트에서 한 번 결제({krw}, 부가세 포함)하면 결제가 승인된 때부터 364일 동안 Clean Space 웹사이트 버전의 모든 기능을 쓸 수 있습니다. 자동으로 갱신되지 않으며, 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있습니다. 웹사이트 버전에만 적용되며 Mac App Store 버전에는 적용되지 않습니다. | One payment of {krw} (VAT included) or {usd} on this site that unlocks every feature of the Clean Space website edition for 364 days from the moment the payment is approved. It doesn't renew, and the basic features stay after the access period. It is for the website edition only, not the Mac App Store app. | pending review | {krw}: the won price, ₩3,300 |
| 113 | `COPY (product page).ko.availableFaq.answer` (clean-space/channel-copy.ts) | 네. 이 페이지에서 웹사이트 버전을 내려받을 수 있습니다. Mac App Store 버전은 출시를 준비하고 있으며, 출시되면 이 페이지에 링크를 걸어 두겠습니다. | Yes: download the website edition from this page. Its Mac App Store listing is being prepared, and this page will link to it once it is available. | pending review |  |
| 114 | `COPY.ko.loading` (clean-space/copy.ts) | 불러오는 중… | Loading… | pending review | Chord to MIDI's reviewed `loading` |
| 115 | `COPY.ko.tryAgain` (clean-space/copy.ts) | 다시 시도 | Try again | pending review | Chord to MIDI's reviewed `tryAgain` |
| 116 | `COPY.ko.notConfigured` (clean-space/copy.ts) | 이 사이트에서는 아직 Clean Space 계정과 구매를 이용할 수 없습니다. | Clean Space accounts and purchases are not available on this site yet. | pending review |  |
| 117 | `COPY.ko.accountChanged` (clean-space/copy.ts) | 진행하는 동안 다른 계정으로 로그인되어 그 결과를 쓰지 않았습니다. 다시 시도해 주세요. | You signed in to another account while this was in progress, so its answer was not used. Try again. | pending review |  |
| 118 | `COPY.ko.signedInAs` (clean-space/copy.ts) | {label}(으)로 로그인됨 | Signed in as {label} | pending review | Chord to MIDI's reviewed `signedInAs` |
| 119 | `COPY.ko.thisAccount` (clean-space/copy.ts) | 이 계정 | this account | pending review |  |
| 120 | `COPY.ko.signOutHere` (clean-space/copy.ts) | 이 브라우저에서 로그아웃 | Sign out of this browser | pending review |  |
| 121 | `COPY.ko.signInTitle` (clean-space/copy.ts) | 로그인 | Sign in | pending review | Chord to MIDI's reviewed sign-in title |
| 122 | `COPY.ko.signInIntro` (clean-space/copy.ts) | Google, 카카오 또는 네이버 계정으로 로그인하세요. 구매는 로그인한 계정에 적용됩니다. | Sign in with Google, Kakao or Naver. A purchase belongs to the account you sign in with. | pending review |  |
| 123 | `COPY.ko.continueWith` (clean-space/copy.ts) | Google로 계속하기 / 카카오 로그인 / 네이버 로그인 | Continue with {provider} | pending review | Chord to MIDI's reviewed sign-in buttons |
| 124 | `COPY.ko.signInBusy`, `callbackWorking` (clean-space/copy.ts) | 로그인하는 중… | Signing in… / Finishing sign-in… | pending review | Chord to MIDI's reviewed `callback.working` |
| 125 | `COPY.ko.signInFailures.cancelled` (clean-space/copy.ts) | 로그인을 취소했습니다. | Signing in was cancelled. | pending review | Chord to MIDI's reviewed `errors.cancelled` |
| 126 | `COPY.ko.signInFailures.missing`, `.state` (clean-space/copy.ts) | 이 탭에서 시작한 로그인이 아니거나 이미 끝난 로그인입니다. 처음부터 다시 로그인해 주세요. | This sign-in did not start in this tab, or it was already finished. Start signing in again. | pending review |  |
| 127 | `COPY.ko.signInFailures.expired` (clean-space/copy.ts) | 로그인 시간이 지났습니다. 처음부터 다시 로그인해 주세요. | Signing in took too long. Start again. | pending review | Chord to MIDI's reviewed `errors.expired` |
| 128 | `COPY.ko.signInFailures.storage` (clean-space/copy.ts) | 이 브라우저가 로그인에 필요한 저장소를 막고 있습니다. cultureand.tech의 사이트 데이터를 허용하거나 다른 브라우저를 사용해 주세요. | This browser blocks the storage that signing in needs. Allow site data for cultureand.tech, or use another browser. | pending review | after Chord to MIDI's `errors.storage` |
| 129 | `COPY.ko.signInFailures.account-mismatch` (clean-space/copy.ts) | 이 작업을 시작한 계정과 다른 계정으로 로그인되어 있습니다. 시작한 계정으로 로그인한 뒤 다시 시도해 주세요. | A different account is signed in now than the one that started this. Sign in to that account and try again. | pending review | Chord to MIDI's reviewed `errors.accountMismatch` |
| 130 | `COPY.ko.signInFailures.signed-out` (clean-space/copy.ts) | 먼저 로그인해 주세요. | Sign in first. | pending review | Chord to MIDI's reviewed `errors.signedOut` |
| 131 | `COPY.ko.signInFailures.unavailable` (clean-space/copy.ts) | 지금은 이 로그인 방법을 사용할 수 없습니다. | This sign-in method is not available yet. | pending review |  |
| 132 | `COPY.ko.signInFailures.refused` (clean-space/copy.ts) | 로그인하지 못했습니다. 처음부터 다시 로그인해 주세요. | Signing in did not work. Start again. | pending review |  |
| 133 | `COPY.ko.popupFailed` (clean-space/copy.ts) | Google 창을 열지 못했습니다. cultureand.tech의 팝업을 허용한 뒤 다시 시도해 주세요. | The Google window could not open. Allow pop-ups for cultureand.tech and try again. | pending review |  |
| 134 | `COPY.ko.callbackTitle` (clean-space/copy.ts) | 로그인 | Signing in | pending review | Chord to MIDI's reviewed `callback.title` |
| 135 | `COPY.ko.contactHeading` (clean-space/copy.ts) | 연락용 이메일 | Contact email | pending review | the facts sheet's term |
| 136 | `COPY.ko.contactIntro` (clean-space/copy.ts) | 결제하기 전에 이메일 주소를 확인해 주세요. 토스페이먼츠가 영수증을 이 주소로 보내며, 문의 답변과 중요한 안내에도 씁니다. 이메일을 받기만 하는 주소이며 로그인 방법이 아닙니다. | Confirm an email address before you pay: Toss Payments sends your receipts there, and we use it for support and important notices. It only receives email: it is not a way to sign in. | pending review |  |
| 137 | `COPY.ko.contactEmailLabel` (clean-space/copy.ts) | 이메일 주소 | Email address | pending review |  |
| 138 | `COPY.ko.contactSend` (clean-space/copy.ts) | 코드 보내기 | Send code | pending review |  |
| 139 | `COPY.ko.contactCodeLabel` (clean-space/copy.ts) | 6자리 코드 | 6-digit code | pending review |  |
| 140 | `COPY.ko.contactCodeSent` (clean-space/copy.ts) | {email}(으)로 코드를 보냈습니다. 15분 안에 입력해 주세요. | We sent a code to {email}. Enter it within 15 minutes. | pending review |  |
| 141 | `COPY.ko.contactConfirm` (clean-space/copy.ts) | 확인 | Confirm | pending review |  |
| 142 | `COPY.ko.contactResend` (clean-space/copy.ts) | 다른 주소 사용 | Use another address | pending review |  |
| 143 | `COPY.ko.contactConfirmed` (clean-space/copy.ts) | 연락용 이메일: {email} | Contact email: {email} | pending review |  |
| 144 | `COPY.ko.contactInvalidEmail` (clean-space/copy.ts) | 올바른 이메일 주소를 입력해 주세요. | Enter a valid email address. | pending review |  |
| 145 | `COPY.ko.contactInvalidCode` (clean-space/copy.ts) | 이메일로 받은 6자리 코드를 입력해 주세요. | Enter the 6-digit code from the email. | pending review |  |
| 146 | `COPY.ko.contactNone` (clean-space/copy.ts) | 아직 확인한 연락용 이메일이 없습니다. | No contact email confirmed yet. | pending review |  |
| 147 | `COPY.ko.contactChange` (clean-space/copy.ts) | 연락용 이메일 변경 | Change contact email | pending review |  |
| 148 | `COPY.ko.accountTitle` (clean-space/copy.ts) | Clean Space 계정 | Your Clean Space account | pending review |  |
| 149 | `COPY.ko.methodsHeading` (clean-space/copy.ts) | 로그인 방법 | Sign-in methods | pending review | Chord to MIDI's reviewed `methods.title` |
| 150 | `COPY.ko.linkedLabel` (clean-space/copy.ts) | 연결됨 | Linked | pending review | Chord to MIDI's reviewed `methods.linked` |
| 151 | `COPY.ko.linkMethod` (clean-space/copy.ts) | {provider} 연결 | Link {provider} | pending review | after Chord to MIDI's `methods.add` |
| 152 | `COPY.ko.removeMethod` (clean-space/copy.ts) | 해제 | Remove | pending review | Chord to MIDI's reviewed `methods.remove` |
| 153 | `COPY.ko.lastMethod` (clean-space/copy.ts) | 이 방법을 해제하기 전에 다른 로그인 방법을 연결해 주세요. | Add another sign-in method before removing this one. | pending review |  |
| 154 | `COPY.ko.recentSignInNeeded` (clean-space/copy.ts) | 보안을 위해 로그인 방법을 바꾸거나 계정을 삭제하기 전에 다시 로그인해 주세요. | For your security, sign in again before changing sign-in methods or deleting the account. | pending review | after Chord to MIDI's `errors.recentSignIn` |
| 155 | `COPY.ko.signInAgain` (clean-space/copy.ts) | 다시 로그인 | Sign in again | pending review |  |
| 156 | `COPY.ko.deleteHeading`, `deleteButton` (clean-space/copy.ts) | 계정 삭제 | Delete account | pending review | Chord to MIDI's reviewed `deleteTitle` |
| 157 | `COPY.ko.deleteText` (clean-space/copy.ts) | 계정을 삭제해도 환불되지 않습니다. 남은 이용 기간은 끝나고 Mac의 Clean Space는 기본 기능으로 돌아가며, 결제 기록은 법령에 따라 보관합니다. 환불을 원하시면 먼저 환불을 요청해 주세요. | Deleting your account is not a refund. Any remaining access period ends, Clean Space on your Macs returns to the basic features, and payment records are kept as the law requires. To ask for a refund, use Request a refund first. | pending review |  |
| 158 | `COPY.ko.deleteConfirm` (clean-space/copy.ts) | 계정을 삭제해도 환불되지 않는다는 것을 이해했습니다. | I understand that deleting my account is not a refund. | pending review |  |
| 159 | `COPY.ko.deleteRequested` (clean-space/copy.ts) | {date}에 삭제를 요청했습니다. 삭제는 자동으로 끝납니다. | Deletion was requested on {date}. It finishes by itself. | pending review |  |
| 160 | `COPY.ko.providerNames` (clean-space/copy.ts) | Google / 카카오 / 네이버 | Google / Kakao / Naver | pending review | Chord to MIDI's reviewed provider names |
| 161 | `COPY.ko.signInIntro` (clean-space/copy.ts) | Google, 카카오, 네이버 계정 또는 이메일 주소로 로그인하세요. 구매는 로그인한 계정에 적용됩니다. | Sign in with Google, Kakao, Naver or your email address. A purchase belongs to the account you sign in with. | pending review | Replaces row 122's wording (email sign-in added) |
| 162 | `COPY.ko.continueWithEmail` (clean-space/copy.ts) | 이메일로 계속하기 | Continue with email | pending review | Chord to MIDI's reviewed `auth.buttons.email` |
| 163 | `COPY.ko.emailLabel` (clean-space/copy.ts) | 이메일 주소 | Email address | pending review | Chord to MIDI's reviewed `auth.email.label` |
| 164 | `COPY.ko.emailSend` (clean-space/copy.ts) | 로그인 링크 보내기 | Send sign-in link | pending review | Chord to MIDI's reviewed `auth.email.send` |
| 165 | `COPY.ko.emailSending` (clean-space/copy.ts) | 보내는 중… | Sending… | pending review | Chord to MIDI's reviewed `auth.email.sending` |
| 166 | `COPY.ko.emailSent` (clean-space/copy.ts) | {email}(으)로 로그인 링크를 보냈습니다. 이 기기나 다른 기기에서 링크를 열면 로그인됩니다. 도착까지 1분쯤 걸릴 수 있으니 스팸함도 확인해 주세요. | We sent a sign-in link to {email}. Open it on this device or another to sign in. It can take a minute to arrive; check the spam folder too. | pending review | Chord to MIDI's reviewed `auth.email.sent` |
| 167 | `COPY.ko.emailSentHere` (clean-space/copy.ts) | {email}(으)로 로그인 링크를 보냈습니다. 이 브라우저에서 링크를 열면 계속됩니다. | We sent a sign-in link to {email}. Open it in this browser to continue. | pending review | Chord to MIDI's reviewed `auth.reauth.emailSent` |
| 168 | `COPY.ko.emailResend` (clean-space/copy.ts) | 다시 보내기 | Send again | pending review | Chord to MIDI's reviewed `auth.email.resend` |
| 169 | `COPY.ko.emailWait` (clean-space/copy.ts) | 1분 뒤에 다시 보낼 수 있습니다. | You can send it again in a minute. | pending review | Chord to MIDI's reviewed `auth.email.wait` |
| 170 | `COPY.ko.emailOtherAddress` (clean-space/copy.ts) | 다른 주소 사용 | Use another address | pending review | Chord to MIDI's reviewed `auth.email.otherAddress` |
| 171 | `COPY.ko.emailNote` (clean-space/copy.ts) | 비밀번호는 없습니다. 새 브라우저에서 로그인할 때마다 이메일로 링크를 보내 드립니다. 처음 쓰는 주소로는 새 계정이 만들어집니다. | No password: we email you a link whenever you sign in on a new browser. A new address makes a new account. | pending review | Chord to MIDI's reviewed `auth.email.note` |
| 172 | `COPY.ko.emailSeparate` (clean-space/copy.ts) | 이 주소는 로그인에만 쓰입니다. 영수증은 계정 페이지에서 확인한 연락용 이메일로 받습니다. | This address only signs you in. Receipts go to the contact email you confirm on your account page. | pending review | New: the sign-in email is not the contact email |
| 173 | `COPY.ko.emailTooMany` (clean-space/copy.ts) | 이메일을 너무 많이 보냈습니다. 몇 분 뒤에 다시 시도해 주세요. | Too many emails were sent. Wait a few minutes, then try again. | pending review | Chord to MIDI's reviewed `auth.email.tooMany` |
| 174 | `COPY.ko.emailNotAllowed` (clean-space/copy.ts) | 지금은 이메일로 로그인할 수 없습니다. | Signing in by email is not available right now. | pending review | Chord to MIDI's reviewed `auth.email.notAllowed` |
| 175 | `COPY.ko.emailLinkTitle` (clean-space/copy.ts) | 이메일 링크 | Email link | pending review | Chord to MIDI's reviewed `auth.link.title` |
| 176 | `COPY.ko.emailLinkWorking` (clean-space/copy.ts) | 링크를 확인하는 중… | Checking the link… | pending review | Chord to MIDI's reviewed `auth.link.working` |
| 177 | `COPY.ko.emailLinkNeedEmail` (clean-space/copy.ts) | 링크를 받은 이메일 주소를 입력해 주세요. | Enter the email address the link was sent to. | pending review | Chord to MIDI's reviewed `auth.link.needEmail` |
| 178 | `COPY.ko.emailLinkNeedEmailMismatch` (clean-space/copy.ts) | 이 링크는 다른 주소로 보낸 것입니다. 링크를 받은 주소를 입력해 주세요. | This link was sent to another address. Enter the address it was sent to. | pending review | Chord to MIDI's reviewed `auth.link.needEmailMismatch` |
| 179 | `COPY.ko.emailLinkContinue` (clean-space/copy.ts) | 계속 | Continue | pending review | Chord to MIDI's reviewed `auth.link.continue` |
| 180 | `COPY.ko.emailLinkSwitch` (clean-space/copy.ts) | 이 브라우저에는 다른 계정으로 로그인되어 있습니다. 대신 {email}(으)로 로그인할까요? | You are signed in to another account here. Sign in as {email} instead? | pending review | After Chord to MIDI's `auth.link.switch`, without `({current})` (the page doesn't know the other account's address) |
| 181 | `COPY.ko.emailLinkSwitchConfirm` (clean-space/copy.ts) | {email}(으)로 로그인 | Sign in as {email} | pending review | Chord to MIDI's reviewed `auth.link.switchConfirm` |
| 182 | `COPY.ko.emailLinkStay` (clean-space/copy.ts) | 지금 계정 유지 | Keep the current account | pending review | Chord to MIDI's reviewed `auth.link.stay` |
| 183 | `COPY.ko.emailLinkNeedAccount` (clean-space/copy.ts) | 이 링크를 요청한 계정으로 이 브라우저에서 로그인한 뒤, 이메일의 링크를 다시 열어 주세요. | Sign in in this browser to the account that asked for this link, then open the link from the email again. | pending review | New, after Chord to MIDI's `auth.link.needAccount` |
| 184 | `COPY.ko.emailLinkWrongAccount` (clean-space/copy.ts) | 이 링크는 지금 로그인된 계정이 아닌 다른 계정의 것입니다. 로그아웃한 뒤 요청한 계정으로 로그인해 주세요. | This link belongs to another account than the one signed in here. Sign out, then sign in to the account that asked for it. | pending review | Chord to MIDI's reviewed `auth.link.wrongAccount` |
| 185 | `COPY.ko.emailLinkExpired` (clean-space/copy.ts) | 이 링크는 만료되었거나, 이미 사용되었거나, 새 링크로 대체되었습니다. 새 링크를 요청해 주세요. | This link has expired, was used already, or a newer one replaced it. Request a new one. | pending review | Chord to MIDI's reviewed `auth.link.expired` |
| 186 | `COPY.ko.emailLinkInvalid` (clean-space/copy.ts) | 이 페이지는 이메일에 있는 링크 그대로 열어야 합니다. | This page needs the link from the email, as it came. | pending review | Chord to MIDI's reviewed `auth.link.invalid` |
| 187 | `COPY.ko.emailLinkBusy` (clean-space/copy.ts) | 지금은 로그인이 너무 많습니다. 몇 분 뒤에 다시 시도해 주세요. | Too many sign-ins right now. Wait a few minutes, then try again. | pending review | Chord to MIDI's reviewed `auth.link.busy` |
| 188 | `COPY.ko.emailLinkConflict` (clean-space/copy.ts) | {email}은(는) 이미 다른 Clean Space 계정의 로그인 방법이라 이 계정에 추가할 수 없습니다. 옮겨진 것은 없습니다. | {email} already signs in to another Clean Space account, so it can't be added to this one. Nothing was moved. | pending review | New, after Chord to MIDI's `auth.link.conflict` and `auth.errors.identityInUse` |
| 189 | `COPY.ko.emailLinkAlreadyLinked` (clean-space/copy.ts) | 이 계정에는 이미 이메일 로그인이 있습니다. 다른 주소를 쓰려면 먼저 해제해 주세요. | This account has an email sign-in already. Remove it first to use another address. | pending review | New |
| 190 | `COPY.ko.emailLinkDeleted` (clean-space/copy.ts) | 삭제 중인 계정입니다. | This account is being deleted. | pending review | Chord to MIDI's reviewed `auth.errors.accountDeleted` |
| 191 | `COPY.ko.emailLinkRequestAgain` (clean-space/copy.ts) | 새 링크 요청 | Request a new link | pending review | Chord to MIDI's reviewed `auth.link.requestAgain` |
| 192 | `COPY.ko.emailLinkLinked` (clean-space/copy.ts) | 이 계정에 이메일 로그인을 추가했습니다. | Email sign-in was added to this account. | pending review | New |
| 193 | `COPY.ko.emailLinkDoneElsewhere` (clean-space/copy.ts) | 로그인되었습니다. 처음 시작한 탭으로 돌아가면 그곳에서 이어집니다. | You are signed in. Go back to the tab where you started: it continues there. | pending review | New (a link opened in a new tab while the activation page waits in the first) |
| 194 | `COPY.ko.providerNames.email` (clean-space/copy.ts) | 이메일 | Email | pending review | Chord to MIDI's reviewed `auth.providers.email` ("email" in English there; capitalised here as a list label) |
| 195 | `COPY.ko.methodEmailAddress` (clean-space/copy.ts) | 로그인 이메일: {email} | Sign-in email: {email} | pending review | New |
| 196 | `COPY.ko.methodEmailNote` (clean-space/copy.ts) | 이 주소로 보내는 링크로 로그인합니다. 연락용 이메일과는 별개입니다. | Signs in with a link sent to this address. It is separate from your contact email. | pending review | New |
| 197 | `COPY.ko.linkEmailIntro` (clean-space/copy.ts) | 로그인에 쓸 주소를 입력해 주세요. 그 주소로 링크를 보내 드리며, 이 브라우저에서 링크를 열면 이 계정에 추가됩니다. | Enter the address to sign in with. We send it a link; open it in this browser to add it to this account. | pending review | New |
| 198 | `COPY.ko.emailLinkChanged` (clean-space/copy.ts) | 이 링크를 처리하는 동안 여기에 로그인된 계정이 바뀌어 아무것도 바꾸지 않았습니다. 계정 페이지를 확인하고, 필요하면 새 링크를 받아 주세요. | The account signed in here changed while this link was finishing, so nothing was changed. Check your account page, and use a new link if you still need one. | pending review |  |
