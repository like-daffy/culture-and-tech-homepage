import { CleanSpaceAppPage } from "@/components/CleanSpaceAppPage";

/**
 * clean-space.app's English page: Clean Space's product page at the site's root. Built only with
 * NEXT_PUBLIC_SITE=clean-space-app (next.config.mjs); cultureand.tech's build never sees this file.
 */
export default function CleanSpaceAppHome() {
  return <CleanSpaceAppPage language="en" />;
}
