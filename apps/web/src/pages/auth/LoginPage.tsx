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
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SocialAuth } from "@/features/auth/components/SocialAuth"
import { useLogin } from "@/features/auth/queries"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginRequest } from "shared"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function LoginPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { t } = useTranslation()
    const { mutate: login, isPending } = useLogin()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = (data: LoginRequest) => {
        login(data)
    }

    return (
        <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto p-4 mt-10", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t('auth.login.title')}</CardTitle>
                    <CardDescription>
                        {t('auth.login.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Field>
                                <SocialAuth />
                            </Field>

                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                {t('auth.oauth.continue_with')}
                            </FieldSeparator>

                            <Field>
                                <FieldLabel htmlFor="account">{t('auth.fields.email')}</FieldLabel>
                                <Input
                                    id="account"
                                    type="text" // Supports username or email
                                    placeholder="m@example.com"
                                    {...register('account')}
                                />
                                {errors.account && <span className="text-sm text-red-500">{errors.account.message}</span>}
                            </Field>

                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">{t('auth.fields.password')}</FieldLabel>
                                    <Link
                                        to="/forgot-password"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                    >
                                        {t('auth.login.forgot_password')}
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                />
                                {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                            </Field>

                            <Field>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? t('common.loading') : t('auth.login.submit')}
                                </Button>
                                <div className="text-center text-sm">
                                    {t('auth.login.no_account')} <Link to="/register" className="underline hover:text-primary">{t('auth.login.register')}</Link>
                                </div>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
