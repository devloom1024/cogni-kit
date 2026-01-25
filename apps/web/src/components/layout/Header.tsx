import { ThemeSwitch } from "@/components/theme/ThemeSwitch"
import { LanguageSwitch } from "@/components/theme/LanguageSwitch"

export function Header() {
  return (
    <div className="flex items-center gap-4">
      <ThemeSwitch />
      <LanguageSwitch />
    </div>
  )
}
