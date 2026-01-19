#!/bin/bash

# 金融数据服务启动脚本

echo "🚀 启动金融数据服务..."

# 激活虚拟环境并启动服务
uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
