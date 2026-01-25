import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Home } from "@/pages/Home"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/callback/:provider" element={<OAuthCallbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
