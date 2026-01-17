#!/usr/bin/env bun

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT_DIR = resolve(import.meta.dir, '..')
const ROOT_ENV = resolve(ROOT_DIR, '.env')

const ENV_MAPPINGS = {
  'apps/server/.env': {
    prefix: 'SERVER_',
    shared: ['NODE_ENV', 'DATABASE_URL', 'REDIS_URL', 'FRONTEND_URL', 'BACKEND_URL'],
    stripPrefix: true,
  },
  'apps/web/.env': {
    prefix: 'WEB_',
    shared: ['NODE_ENV', 'FRONTEND_URL', 'BACKEND_URL'],
    stripPrefix: true,
  },
  'infra/docker/.env': {
    prefix: '',
    shared: [
      'POSTGRES_USER',
      'POSTGRES_PASSWORD', 
      'POSTGRES_DB',
      'DOCKER_POSTGRES_PORT',
      'DOCKER_REDIS_PORT',
    ],
    stripPrefix: false,
  },
}

function parseEnv(content: string): Record<string, string> {
  const env: Record<string, string> = {}
  
  content.split('\n').forEach(line => {
    line = line.trim()
    if (!line || line.startsWith('#')) return
    
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      env[match[1]] = match[2]
    }
  })
  
  return env
}

function syncEnv() {
  if (!existsSync(ROOT_ENV)) {
    console.error('❌ 根目录 .env 文件不存在')
    process.exit(1)
  }

  const rootEnv = parseEnv(readFileSync(ROOT_ENV, 'utf-8'))
  
  console.log('🔄 开始同步环境变量...\n')

  Object.entries(ENV_MAPPINGS).forEach(([targetPath, config]) => {
    const fullPath = resolve(ROOT_DIR, targetPath)
    const envLines: string[] = []
    
    envLines.push('# ⚠️  此文件由 scripts/sync-env.ts 自动生成')
    envLines.push('# ⚠️  请勿直接修改，在根目录 .env 中修改后运行: bun run sync-env')
    envLines.push('')
    
    if (config.shared.length > 0) {
      envLines.push('# 共享配置')
      config.shared.forEach(key => {
        if (rootEnv[key]) {
          envLines.push(`${key}=${rootEnv[key]}`)
        }
      })
      envLines.push('')
    }
    
    if (config.prefix) {
      envLines.push(`# ${config.prefix}前缀变量`)
      Object.entries(rootEnv).forEach(([key, value]) => {
        if (key.startsWith(config.prefix)) {
          const newKey = config.stripPrefix 
            ? key.substring(config.prefix.length)
            : key
          envLines.push(`${newKey}=${value}`)
        }
      })
    }
    
    writeFileSync(fullPath, envLines.join('\n') + '\n')
    console.log(`✅ 已同步: ${targetPath}`)
  })
  
  console.log('\n✨ 环境变量同步完成！')
}

syncEnv()
