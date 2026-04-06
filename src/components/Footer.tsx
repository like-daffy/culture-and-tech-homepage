import { useLanguage } from "@/contexts/LanguageProvider";

export function Footer() {
  const { translations } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border py-8 overflow-hidden">
      {/* Video Background Preview (Thumbnail) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://img.youtube.com/vi/ynYmTnt9xjY/maxresdefault.jpg')",
        }}
      />

      {/* Video Background (Auto-play) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
            {translations.contact.email}: {translations.contact.address}
          </p>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {translations.footer.description}
          </p>
          
          {/* Separator */}
          <div className="pt-4">
            <div className="w-full max-w-md mx-auto border-t border-white/30 mb-4"></div>
            <p className="text-xs text-white/80 drop-shadow-lg">
              © {currentYear} Culture & Tech. {translations.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}