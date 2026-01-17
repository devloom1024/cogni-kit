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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordRequest, VerificationCodeType } from "shared"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

export function ForgotPasswordPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { t } = useTranslation()
    const { mutate: resetPassword, isPending } = useForgotPassword()
    const { mutate: sendCode, isPending: isSending } = useSendCode()
    const [countdown, setCountdown] = useState(0)

    const { register, handleSubmit, getValues, trigger, formState: { errors } } = useForm<ForgotPasswordRequest>({
        resolver: zodResolver(forgotPasswordSchema)
    })

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const onSendCode = async () => {
        const email = getValues('email')
        const isValid = await trigger('email')
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
                    <CardTitle className="text-xl">{t('auth.login.forgot_password')}</CardTitle>
                    <CardDescription>
                        {t('auth.register.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">{t('auth.fields.email')}</FieldLabel>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
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
                                {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="code">{t('auth.fields.code')}</FieldLabel>
                                <Input
                                    id="code"
                                    type="text"
                                    {...register('code')}
                                />
                                {errors.code && <span className="text-sm text-red-500">{errors.code.message}</span>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="newPassword">{t('auth.fields.password')}</FieldLabel>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    {...register('newPassword')}
                                />
                                {errors.newPassword && <span className="text-sm text-red-500">{errors.newPassword.message}</span>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="repeatNewPassword">{t('auth.fields.repeat_password')}</FieldLabel>
                                <Input
                                    id="repeatNewPassword"
                                    type="password"
                                    {...register('repeatNewPassword')}
                                />
                                {errors.repeatNewPassword && <span className="text-sm text-red-500">{errors.repeatNewPassword.message}</span>}
                            </Field>

                            <Field>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? t('common.loading') : t('common.submit')}
                                </Button>
                                <Button variant="ghost" asChild className="mt-2">
                                    <Link to="/login">{t('auth.register.login')}</Link>
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
