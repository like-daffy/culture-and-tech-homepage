import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import "@/styles/globals.css";

// clean-space.app's app shell: the homepage's own (src/pages/_app.tsx), written out here because Next.js takes global CSS
// only from the custom App file itself. Keep the two the same.
export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
      <Toaster />
    </LanguageProvider>
  );
}
