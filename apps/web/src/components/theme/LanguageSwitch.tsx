import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"

const LANGUAGES = [
    { code: 'zh', label: '中文', short: '中' },
    { code: 'en', label: 'English', short: 'EN' },
] as const

export function LanguageSwitch() {
    const { i18n } = useTranslation()

    // Find current language config, fallback to first item
    const currentLang = LANGUAGES.find(l => i18n.language?.startsWith(l.code)) ?? LANGUAGES[0]

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
        localStorage.setItem('i18nextLng', lng)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-sm font-bold">
                        {currentLang.short}
                    </span>
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="justify-between"
                    >
                        {lang.label}
                        {i18n.language?.startsWith(lang.code) && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
