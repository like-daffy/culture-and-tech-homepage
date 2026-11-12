import { Check, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageProvider";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      {/* On phones (below md) only as wide as its icon, language and chevron, evenly spaced, so the name beside the logo
          keeps to one line at 390 px; from md up a 150 px box as before */}
      <SelectTrigger className="w-auto gap-1.5 px-2 md:w-[150px] md:gap-0 md:px-3 h-9 bg-background border-border">
        <Languages className="h-4 w-4 md:mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <div className="flex items-center gap-2">
            English
            {language === "en" && <Check className="h-3 w-3" />}
          </div>
        </SelectItem>
        <SelectItem value="ko">
          <div className="flex items-center gap-2">
            한국어
            {language === "ko" && <Check className="h-3 w-3" />}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}