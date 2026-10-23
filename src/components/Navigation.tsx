import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/contexts/LanguageProvider";

interface NavigationProps {
  /**
   * On pages other than the homepage: the homepage in the language shown ("/" or "/ko/").
   * The menu then links to the homepage's sections instead of scrolling within this page.
   */
  homePath?: string;
}

export function Navigation({ homePath }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { translations } = useLanguage();

  const menuItems = [
    { label: translations.navigation.home, href: "#home" },
    { label: translations.navigation.about, href: "#about" },
    { label: translations.navigation.apps, href: "#apps" },
    { label: translations.navigation.services, href: "#services" },
    { label: translations.navigation.contact, href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Address of a homepage section from another page; the top of the homepage needs no fragment
  const homeHref = (href: string) => (href === "#home" ? homePath : `${homePath}${href}`);

  const renderItem = (item: { label: string; href: string }, className: string) =>
    homePath ? (
      <Link key={item.href} href={homeHref(item.href)} onClick={() => setIsOpen(false)} className={className}>
        {item.label}
      </Link>
    ) : (
      <button key={item.href} onClick={() => handleNavClick(item.href)} className={className}>
        {item.label}
      </button>
    );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link href={homePath ?? "#home"} className="text-xl font-semibold text-primary">
          {translations.navigation.brandName}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) =>
            renderItem(item, "text-sm font-medium text-foreground hover:text-accent transition-colors")
          )}
          <LanguageSwitch />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitch />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) =>
                  renderItem(
                    item,
                    "text-left text-lg font-medium text-foreground hover:text-accent transition-colors py-2"
                  )
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
