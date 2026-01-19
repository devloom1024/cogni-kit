#!/usr/bin/env bun
/**
 * i18n Key 检测脚本
 * 
 * 功能：
 * 1. 检测代码中使用但在翻译文件中缺失的 i18n key
 * 2. 检测翻译文件中定义但在代码中未使用的 i18n key（多余的 key）
 * 
 * 使用方式：
 * bun run scripts/check-i18n.ts
 */

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
}

interface I18nKey {
    key: string
    file: string
    line: number
}

interface FlattenedTranslations {
    [key: string]: string
}

// 展平嵌套的翻译对象
function flattenObject(obj: any, prefix = ''): FlattenedTranslations {
    const result: FlattenedTranslations = {}

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(result, flattenObject(obj[key], fullKey))
        } else {
            result[fullKey] = obj[key]
        }
    }

    return result
}

// 从文件内容中提取 i18n key
function extractI18nKeysFromContent(content: string, filePath: string): I18nKey[] {
    const keys: I18nKey[] = []
    const lines = content.split('\n')

    // 匹配 validation.*, auth.*, error.*, rate_limit.*, email.* 等格式的 key
    const i18nKeyRegex = /['"]([a-z_]+\.[a-z_]+(?:\.[a-z_]+)*)['"]/g

    lines.forEach((line, index) => {
        let match
        while ((match = i18nKeyRegex.exec(line)) !== null) {
            const key = match[1]
            // 只提取以特定前缀开头的 key
            if (key.startsWith('validation.') ||
                key.startsWith('auth.') ||
                key.startsWith('error.') ||
                key.startsWith('rate_limit.') ||
                key.startsWith('email.')) {
                keys.push({
                    key,
                    file: filePath,
                    line: index + 1
                })
            }
        }
    })

    return keys
}

// 递归遍历目录查找 TypeScript 文件
async function findTsFiles(dir: string): Promise<string[]> {
    const files: string[] = []

    try {
        const entries = await readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = join(dir, entry.name)

            if (entry.isDirectory()) {
                // 跳过 node_modules 和 .git
                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
                    continue
                }
                files.push(...await findTsFiles(fullPath))
            } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                files.push(fullPath)
            }
        }
    } catch (error) {
        // 忽略无法访问的目录
    }

    return files
}

// 从代码中提取所有使用的 i18n key
async function extractUsedKeys(baseDir: string): Promise<I18nKey[]> {
    const tsFiles = await findTsFiles(baseDir)
    const allKeys: I18nKey[] = []

    for (const file of tsFiles) {
        const content = await readFile(file, 'utf-8')
        const keys = extractI18nKeysFromContent(content, file.replace(baseDir + '/', ''))
        allKeys.push(...keys)
    }

    return allKeys
}

// 读取翻译文件
async function loadTranslations(locale: string): Promise<FlattenedTranslations> {
    const translationPath = join(process.cwd(), `packages/shared/src/i18n/locales/${locale}.json`)
    const content = await readFile(translationPath, 'utf-8')
    const translations = JSON.parse(content)
    return flattenObject(translations)
}

// 主函数
async function main() {
    console.log(`${colors.cyan}🔍 开始检测 i18n keys...${colors.reset}\n`)

    // 1. 提取代码中使用的 key
    const baseDir = join(process.cwd(), 'packages/shared/src')
    const usedKeys = await extractUsedKeys(baseDir)
    const uniqueUsedKeys = [...new Set(usedKeys.map(k => k.key))].sort()

    console.log(`${colors.blue}📝 代码中使用的 i18n keys: ${uniqueUsedKeys.length}${colors.reset}`)

    // 2. 加载翻译文件
    const zhTranslations = await loadTranslations('zh')
    const enTranslations = await loadTranslations('en')

    const definedKeys = Object.keys(zhTranslations).sort()
    console.log(`${colors.blue}📚 中文翻译文件中定义的 keys: ${definedKeys.length}${colors.reset}`)
    console.log(`${colors.blue}📚 英文翻译文件中定义的 keys: ${Object.keys(enTranslations).length}${colors.reset}\n`)

    // 3. 检测缺失的 key
    const missingKeys = uniqueUsedKeys.filter(key => !definedKeys.includes(key))

    if (missingKeys.length > 0) {
        console.log(`${colors.red}❌ 缺失的 i18n keys (在代码中使用但未定义): ${missingKeys.length}${colors.reset}`)
        missingKeys.forEach(key => {
            const usage = usedKeys.filter(k => k.key === key)
            console.log(`  ${colors.yellow}${key}${colors.reset}`)
            usage.slice(0, 3).forEach(u => {
                console.log(`    → ${u.file}:${u.line}`)
            })
            if (usage.length > 3) {
                console.log(`    ... 还有 ${usage.length - 3} 处使用`)
            }
        })
        console.log()
    } else {
        console.log(`${colors.green}✅ 没有缺失的 i18n keys${colors.reset}\n`)
    }

    // 4. 检测多余的 key
    const unusedKeys = definedKeys.filter(key => !uniqueUsedKeys.includes(key))

    if (unusedKeys.length > 0) {
        console.log(`${colors.yellow}⚠️  多余的 i18n keys (已定义但未使用): ${unusedKeys.length}${colors.reset}`)
        unusedKeys.forEach(key => {
            console.log(`  ${colors.yellow}${key}${colors.reset}`)
        })
        console.log()
    } else {
        console.log(`${colors.green}✅ 没有多余的 i18n keys${colors.reset}\n`)
    }

    // 5. 检测中英文翻译不一致
    const keysOnlyInZh = definedKeys.filter(key => !enTranslations[key])
    const keysOnlyInEn = Object.keys(enTranslations).filter(key => !zhTranslations[key])

    if (keysOnlyInZh.length > 0 || keysOnlyInEn.length > 0) {
        console.log(`${colors.red}❌ 中英文翻译不一致${colors.reset}`)

        if (keysOnlyInZh.length > 0) {
            console.log(`  ${colors.yellow}只在中文中存在的 keys: ${keysOnlyInZh.length}${colors.reset}`)
            keysOnlyInZh.forEach(key => console.log(`    - ${key}`))
        }

        if (keysOnlyInEn.length > 0) {
            console.log(`  ${colors.yellow}只在英文中存在的 keys: ${keysOnlyInEn.length}${colors.reset}`)
            keysOnlyInEn.forEach(key => console.log(`    - ${key}`))
        }
        console.log()
    } else {
        console.log(`${colors.green}✅ 中英文翻译一致${colors.reset}\n`)
    }

    // 6. 总结
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
    console.log(`${colors.cyan}📊 总结${colors.reset}`)
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
    console.log(`  使用的 keys:     ${uniqueUsedKeys.length}`)
    console.log(`  定义的 keys:     ${definedKeys.length}`)
    console.log(`  缺失的 keys:     ${missingKeys.length} ${missingKeys.length > 0 ? colors.red + '✗' + colors.reset : colors.green + '✓' + colors.reset}`)
    console.log(`  多余的 keys:     ${unusedKeys.length} ${unusedKeys.length > 0 ? colors.yellow + '⚠' + colors.reset : colors.green + '✓' + colors.reset}`)
    console.log(`  翻译一致性:     ${keysOnlyInZh.length === 0 && keysOnlyInEn.length === 0 ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`)
    console.log()

    // 返回退出码
    const hasErrors = missingKeys.length > 0 || keysOnlyInZh.length > 0 || keysOnlyInEn.length > 0
    process.exit(hasErrors ? 1 : 0)
}

main().catch(error => {
    console.error(`${colors.red}错误:${colors.reset}`, error)
    process.exit(1)
})
