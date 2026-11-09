import { useLanguage } from "@/contexts/LanguageProvider";
import { BUSINESS } from "@/lib/checkout/config";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";

/**
 * The seller's details on every page: the fields Toss Payments' review requires in a merchant's footer (상호, 대표자,
 * 사업자등록번호, 통신판매업 신고번호, 주소, 전화), as registered with Toss. They come from the checkout's BUSINESS and are
 * labelled as on the checkout pages, so the two never differ.
 */
export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const business = BUSINESS[language];
  const labels = CHECKOUT_COPY[language].footer;

  return (
    <footer className="relative border-t border-border py-8 overflow-hidden">
      {/* Video Background Preview (Thumbnail) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://img.youtube.com/vi/ynYmTnt9xjY/maxresdefault.jpg')",
        }}
      />

      {/* Video Background (Auto-play) - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none min-w-full min-h-full w-auto h-auto"
          style={{
            width: "100vw",
            height: "56.25vw", // 16:9 aspect ratio
            minHeight: "100%",
            minWidth: "177.78vh", // 16:9 aspect ratio
          }}
          src="https://www.youtube.com/embed/ynYmTnt9xjY?autoplay=1&mute=1&loop=1&playlist=ynYmTnt9xjY&controls=0&showinfo=0&modestbranding=1&playsinline=1&enablejsapi=1&rel=0"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Footer Background Video"
        />
      </div>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="container relative z-10">
        <div className="text-center space-y-3">
          <p className="text-sm text-white/90 drop-shadow-lg">
            {labels.seller}: {business.companyName} | {labels.representative}: {business.representative} |{" "}
            {labels.registrationNumber}: {business.registrationNumber}
          </p>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {labels.mailOrderNumber}: {business.mailOrderNumber}
          </p>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {labels.address}: {business.address}
          </p>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {labels.phone}: {business.phone} | {labels.email}:{" "}
            <a className="underline" href={`mailto:${business.email}`}>
              {business.email}
            </a>{" "}
            | {labels.hostingProvider}: {business.hostingProvider}
          </p>

          {/* Separator */}
          <div className="pt-4">
            <div className="w-full max-w-md mx-auto border-t border-white/30 mb-4"></div>
            <p className="text-xs text-white/80 drop-shadow-lg">
              © {currentYear} Culture & Tech. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}