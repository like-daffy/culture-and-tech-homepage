/** Review mode is explicit; a missing email alone never means review. */
export function validCheckoutIdentity(value: { review?: unknown; receiptEmail?: unknown }): boolean {
  return value.review === true ? value.receiptEmail === null : value.review === undefined && typeof value.receiptEmail === "string" && value.receiptEmail.length > 0;
}

export function sameCheckoutIdentity(open: { review?: true; receiptEmail: string | null }, order: { review?: true; receiptEmail: string | null }): boolean {
  return validCheckoutIdentity(open) && validCheckoutIdentity(order) && (open.review === true) === (order.review === true);
}
