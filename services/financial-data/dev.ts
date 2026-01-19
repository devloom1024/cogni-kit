#!/usr/bin/env bun

/**
 * 跨平台的开发服务器启动脚本
 * 确保在进程终止时正确清理子进程和进程组
 */

import { spawn, type ChildProcess } from 'child_process';

const PORT = process.env.PORT || '8000';
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 启动金融数据服务...');

// 启动 uvicorn 服务
const uvicorn: ChildProcess = spawn('uv', [
    'run',
    'uvicorn',
    'app.main:app',
    '--host',
    HOST,
    '--port',
    PORT,
    '--reload'
], {
    stdio: 'inherit',
    shell: false,
    detached: false  // 不分离进程，保持在同一个进程组
});

// 标记是否正在清理
let isCleaningUp = false;

// 处理进程退出信号
const cleanup = (signal: string) => {
    // 防止重复调用
    if (isCleaningUp) {
        return;
    }
    isCleaningUp = true;

    console.log(`\n⚠️  收到 ${signal} 信号，正在关闭服务...`);

    try {
        // 在 Unix 系统上，使用负 PID 终止整个进程组
        if (process.platform !== 'win32' && uvicorn.pid) {
            process.kill(-uvicorn.pid, 'SIGTERM');
        } else {
            uvicorn.kill('SIGTERM');
        }
    } catch (err) {
        const error = err as NodeJS.ErrnoException;
        // ESRCH 表示进程不存在，说明已经退出了
        if (error.code === 'ESRCH') {
            console.log('✅ 服务已停止');
            process.exit(0);
        } else {
            console.error('⚠️  终止进程时出错:', error.message);
            process.exit(1);
        }
    }

    // 如果进程在 2 秒内没有退出，强制终止
    const forceKillTimeout = setTimeout(() => {
        try {
            if (!uvicorn.killed && uvicorn.pid) {
                console.log('⚡ 强制终止进程...');
                if (process.platform !== 'win32') {
                    process.kill(-uvicorn.pid, 'SIGKILL');
                } else {
                    uvicorn.kill('SIGKILL');
                }
            }
        } catch (err) {
            // 进程可能已经退出，忽略错误
        }
        process.exit(0);
    }, 2000);

    // 确保超时不会阻止进程退出
    forceKillTimeout.unref();
};

// 监听各种退出信号
process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));

// 处理子进程退出
uvicorn.on('exit', (code, signal) => {
    if (code !== null) {
        console.log(`\n📦 服务已停止 (退出码: ${code})`);
        process.exit(code);
    } else if (signal !== null) {
        console.log(`\n📦 服务被信号终止: ${signal}`);
        process.exit(0);
    }
});

// 处理子进程错误
uvicorn.on('error', (err) => {
    console.error('❌ 启动失败:', err.message);
    process.exit(1);
});
