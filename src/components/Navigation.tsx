import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitch } from "@/components/LanguageSwitch";

interface NavigationProps {
  language: "en" | "ko";
  onLanguageChange: (lang: "en" | "ko") => void;
}

export function Navigation({ language, onLanguageChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = {
    en: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" },
    ],
    ko: [
      { label: "홈", href: "#home" },
      { label: "소개", href: "#about" },
      { label: "서비스", href: "#services" },
      { label: "연락", href: "#contact" },
    ],
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentMenu = menuItems[language];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link href="#home" className="text-xl font-semibold text-primary">
          {language === "ko" ? "컬처앤테크" : "Culture & Tech"}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {currentMenu.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {item.label}
            </button>
          ))}
          <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 mt-8">
                {currentMenu.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="text-left text-lg font-medium text-foreground hover:text-accent transition-colors py-2"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}