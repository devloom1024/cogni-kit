import { FieldError } from "@/components/ui/field"
import { useTranslation } from "react-i18next"
import type { FieldError as RHFFieldError } from "react-hook-form"

interface FormErrorProps {
    error?: RHFFieldError
    className?: string
}

export function FormError({ error, className }: FormErrorProps) {
    const { t } = useTranslation()

    if (!error) return null

    // Create a pseudo error object with translated message for FieldError
    // We only translate if the message is a translation key (which it should be from Zod)
    // If it's a fallback or raw string, t() usually returns the key if not found, 
    // or the string itself if it doesn't match a key structure.
    // Given our schema sets keys like 'validation.password.min', t() will work ideally.

    const translatedError = {
        ...error,
        message: error.message ? t(error.message) : undefined
    }

    return (
        <FieldError
            errors={[translatedError]}
            className={className}
        />
    )
}
