import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForgotPassword, useSendCode } from "@/features/auth/queries"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordRequest, VerificationCodeType } from "shared"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { FormError } from "@/components/form-error"

export function ForgotPasswordPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { t } = useTranslation()
    const { mutate: resetPassword, isPending: isSubmitting } = useForgotPassword()
    const { mutate: sendCode, isPending: isSending } = useSendCode()

    const [countdown, setCountdown] = useState(0)

    const form = useForm<ForgotPasswordRequest>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
            code: "",
            newPassword: "",
            repeatNewPassword: ""
        }
    })

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const onSendCode = async () => {
        const email = form.getValues('email')
        const isValid = await form.trigger('email')
        if (isValid && email) {
            sendCode({ target: email, type: VerificationCodeType.forgot_password }, {
                onSuccess: () => setCountdown(60)
            })
        }
    }

    const onSubmit = (data: ForgotPasswordRequest) => {
        resetPassword(data)
    }

    return (
        <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto p-4 mt-10", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t('auth.forgot_password.title')}</CardTitle>
                    <CardDescription>
                        {t('auth.forgot_password.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">{t('auth.fields.email')}</FieldLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                {...field}
                                                aria-invalid={fieldState.invalid}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={onSendCode}
                                                disabled={countdown > 0 || isSending}
                                            >
                                                {countdown > 0 ? `${countdown}s` : t('auth.fields.send_code')}
                                            </Button>
                                        </div>
                                        <FormError error={fieldState.error} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="code"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="code">{t('auth.fields.code')}</FieldLabel>
                                        <Input
                                            id="code"
                                            type="text"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FormError error={fieldState.error} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="newPassword"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="newPassword">{t('auth.fields.new_password')}</FieldLabel>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FormError error={fieldState.error} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="repeatNewPassword"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="repeatNewPassword">{t('auth.fields.repeat_new_password')}</FieldLabel>
                                        <Input
                                            id="repeatNewPassword"
                                            type="password"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FormError error={fieldState.error} />
                                    </Field>
                                )}
                            />

                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? t('common.loading') : t('auth.forgot_password.submit')}
                                </Button>
                                <div className="text-center text-sm">
                                    <Link to="/login" className="underline hover:text-primary">{t('auth.forgot_password.back_to_login')}</Link>
                                </div>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
