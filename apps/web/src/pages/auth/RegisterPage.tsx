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
import { useRegister, useSendCode } from "@/features/auth/queries"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterRequest, VerificationCodeType } from "shared"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { FormError } from "@/components/forms/FormError"

export function RegisterPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { t } = useTranslation()
    const { mutate: registerUser, isPending: isRegistering } = useRegister()
    const { mutate: sendCode, isPending: isSending } = useSendCode()

    const [countdown, setCountdown] = useState(0)

    const form = useForm<RegisterRequest>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            code: "",
            password: "",
            repeatPassword: ""
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
            sendCode({ target: email, type: VerificationCodeType.register }, {
                onSuccess: () => setCountdown(60)
            })
        }
    }

    const onSubmit = (data: RegisterRequest) => {
        registerUser(data)
    }

    return (
        <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto p-4 mt-10", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t('auth.register.title')}</CardTitle>
                    <CardDescription>
                        {t('auth.register.subtitle')}
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
                                name="password"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">{t('auth.fields.password')}</FieldLabel>
                                        <Input
                                            id="password"
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
                                name="repeatPassword"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="repeatPassword">{t('auth.fields.repeat_password')}</FieldLabel>
                                        <Input
                                            id="repeatPassword"
                                            type="password"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FormError error={fieldState.error} />
                                    </Field>
                                )}
                            />

                            <Field>
                                <Button type="submit" disabled={isRegistering}>
                                    {isRegistering ? t('common.loading') : t('auth.register.submit')}
                                </Button>
                                <div className="text-center text-sm">
                                    {t('auth.register.has_account')} <Link to="/login" className="underline hover:text-primary">{t('auth.register.login')}</Link>
                                </div>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
