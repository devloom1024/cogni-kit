#!/usr/bin/env bun

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT_DIR = resolve(import.meta.dir, '..')
const ROOT_ENV = resolve(ROOT_DIR, '.env')

const REQUIRED_VARS = {
  shared: ['NODE_ENV'],
  server: ['DATABASE_URL', 'REDIS_URL', 'SERVER_JWT_SECRET', 'SERVER_EMAIL_FROM'],
  web: [],
}

function checkEnv() {
  if (!existsSync(ROOT_ENV)) {
    console.error('❌ 根目录 .env 文件不存在')
    console.log('💡 请从 .env.example 复制: cp .env.example .env')
    process.exit(1)
  }

  const content = readFileSync(ROOT_ENV, 'utf-8')
  const env: Record<string, string> = {}
  
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      env[match[1].trim()] = match[2].trim()
    }
  })

  let hasError = false

  console.log('🔍 检查环境变量...\n')

  Object.entries(REQUIRED_VARS).forEach(([category, vars]) => {
    if (vars.length === 0) return
    
    console.log(`📋 ${category.toUpperCase()}:`)
    
    vars.forEach(varName => {
      const value = env[varName]
      
      if (!value || value.startsWith('your-') || value.startsWith('please-change')) {
        console.log(`  ❌ ${varName} - 未配置或使用默认值`)
        hasError = true
      } else {
        console.log(`  ✅ ${varName}`)
      }
    })
    console.log('')
  })

  if (hasError) {
    console.log('⚠️  请配置缺失的环境变量')
    process.exit(1)
  } else {
    console.log('✨ 所有必需的环境变量已配置！')
  }
}

checkEnv()
