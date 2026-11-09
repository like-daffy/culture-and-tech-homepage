// Clean Space's direct sale (docs/clean-space-direct-sale.md): a sensitive page, out of search results. Where an email
// sign-in link lands (the continue URL given to Firebase; contract PAGE_PATH.emailLink).
import { EmailLinkPage } from "@/components/clean-space/EmailLinkPage";

export default function CleanSpaceEmailLink() {
  return <EmailLinkPage lang="en" />;
}
