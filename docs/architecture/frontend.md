# 前端架构文档 (apps/web)

前端使用 React + Vite + shadcn/ui 构建。

## 技术栈

| 类别        | 技术                                       |
| ----------- | ------------------------------------------ |
| 框架        | React + Vite                               |
| UI 组件     | shadcn/ui + Tailwind CSS                   |
| 路由        | React Router                               |
| 状态管理    | TanStack Query (服务端) + Zustand (客户端) |
| 表单        | React Hook Form + Zod                      |
| HTTP 客户端 | axios                                      |
| 国际化      | react-i18next                              |
| 主题切换    | shadcn 内置 (next-themes)                  |
| 工具库      | Lucide React, date-fns, clsx               |

## 目录结构

```
apps/web/
├── public/
│   └── locales/            # 国际化资源文件
├── src/
│   ├── components/        # UI 组件
│   │   ├── ui/           # shadcn 基础组件 (Button, Input...)
│   │   ├── forms/        # 业务表单组件
│   │   └── theme/        # 主题切换组件
│   ├── features/         # 功能模块
│   │   └── auth/         # 登录、注册相关
│   ├── pages/            # 页面组件
│   ├── lib/              # 工具函数
│   │   ├── api.ts        # axios 封装
│   │   └── utils.ts      # 通用工具
│   ├── i18n/             # 国际化配置
│   ├── stores/           # Zustand 状态
│   │   ├── useUserStore.ts
│   │   └── useThemeStore.ts
│   ├── hooks/            # 自定义 Hooks
│   ├── App.tsx
│   └── main.tsx
├── components.json       # shadcn 配置
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 核心模块说明

| 目录            | 说明                                    |
| --------------- | --------------------------------------- |
| `components/ui` | shadcn 基础组件，原子化                 |
| `features/auth` | 认证相关业务逻辑 (登录、注册、找回密码) |
| `lib/api.ts`    | axios 实例 + 请求封装                   |
| `stores/`       | 全局状态 (用户信息、主题等)             |

## 主题切换

shadcn 内置支持主题切换，使用 `next-themes`。

**组件实现**: `src/components/theme/ThemeSwitch.tsx`
```typescript
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-1" />
    </Button>
  )
}
```
