import React, { useState, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
];

interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const { currentLanguage, setLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find((lang) => lang.code === currentLanguage) || languages[0]
  );

  useEffect(() => {
    const lang =
      languages.find((l) => l.code === currentLanguage) || languages[0];
    setSelectedLanguage(lang);
  }, [currentLanguage]);

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setSelectedLanguage(language);
    setLanguage(language.code);
    onLanguageChange?.(language.code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{selectedLanguage.native}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language)}
            className="flex justify-between items-center cursor-pointer hover:bg-green-50"
          >
            <span>{language.name}</span>
            <span className="text-green-600 font-medium">
              {language.native}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
