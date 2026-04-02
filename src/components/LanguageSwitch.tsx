import { Check, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSwitchProps {
  language: "en" | "ko";
  onLanguageChange: (lang: "en" | "ko") => void;
}

export function LanguageSwitch({ language, onLanguageChange }: LanguageSwitchProps) {
  return (
    <Select value={language} onValueChange={(value) => onLanguageChange(value as "en" | "ko")}>
      <SelectTrigger className="w-[120px] h-9 bg-background border-border">
        <Languages className="h-4 w-4 mr-2" />
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