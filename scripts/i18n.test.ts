import { expect, test, describe } from "bun:test";

const BASE_URL = "http://localhost:3001";

describe("I18n & Error Handling", () => {
    test("Should return Chinese validation error", async () => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": "zh-CN",
            },
            body: JSON.stringify({
                email: "invalid-email",
                password: "short",
                repeatPassword: "short",
                code: "123",
            }),
        });

        let text;
        try {
            text = await res.text();
            const data = JSON.parse(text);
            console.log("ZH Validation Response:", data);

            expect(res.status).toBe(400);
            // 检查是否包含中文关键字 (根据 zh.json 配置)
            // 假设 email invalid 对应 "无效的邮箱地址"
            const errors = data.details?.errors || [];
            const emailError = errors.find((e: any) => e.path === "email");
            expect(emailError?.message).toBe("无效的邮箱地址");
        } catch (e) {
            console.error("Failed to parse JSON", res.status, text);
            throw e;
        }
    });

    test("Should return English validation error", async () => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": "en-US",
            },
            body: JSON.stringify({
                email: "invalid-email",
                password: "short",
                repeatPassword: "short",
                code: "123",
            }),
        });

        let text;
        try {
            text = await res.text();
            const data = JSON.parse(text);
            console.log("EN Validation Response:", data);

            expect(res.status).toBe(400);
            const errors = data.details?.errors || [];
            const emailError = errors.find((e: any) => e.path === "email");
            expect(emailError?.message).toBe("Invalid email address");
        } catch (e) {
            console.error("Failed to parse JSON", res.status, text);
            throw e;
        }
    });

    test("Should return Chinese business error (Login Failed)", async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": "zh-CN",
            },
            body: JSON.stringify({
                account: "nonexistent@example.com",
                password: "WrongPassword123!",
            }),
        });

        let text;
        try {
            text = await res.text();
            const data = JSON.parse(text);
            console.log("ZH Login Response:", data);

            expect(res.status).toBe(401);
            expect(data.code).toBe("auth.invalid_credentials");
            expect(data.message).toBe("账号或密码错误");
        } catch (e) {
            console.error("Failed to parse JSON", res.status, text);
            throw e;
        }
    });

    test("Should return English business error (Login Failed)", async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": "en-US",
            },
            body: JSON.stringify({
                account: "nonexistent@example.com",
                password: "WrongPassword123!",
            }),
        });

        let text;
        try {
            text = await res.text();
            const data = JSON.parse(text);
            console.log("EN Login Response:", data);

            expect(res.status).toBe(401);
            expect(data.code).toBe("auth.invalid_credentials");
            expect(data.message).toBe("Invalid account or password");
        } catch (e) {
            console.error("Failed to parse JSON", res.status, text);
            throw e;
        }
    });
});
