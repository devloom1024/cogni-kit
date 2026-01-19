#!/bin/bash

# 测试运行脚本

echo "🧪 Python 金融数据服务测试套件"
echo "================================"
echo ""

# 显示帮助信息
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "用法: ./run_tests.sh [选项]"
    echo ""
    echo "选项:"
    echo "  unit          只运行单元测试（快速）"
    echo "  integration   只运行集成测试（Mock 数据）"
    echo "  api           只运行 API 测试（真实数据，慢速）"
    echo "  fast          运行快速测试（单元 + 集成）"
    echo "  all           运行所有测试"
    echo "  coverage      运行测试并生成覆盖率报告"
    echo ""
    exit 0
fi

# 根据参数运行不同的测试
case "$1" in
    "unit")
        echo "📦 运行单元测试..."
        uv run pytest tests/unit/ -v
        ;;
    "integration")
        echo "🔗 运行集成测试..."
        uv run pytest tests/integration/ -v
        ;;
    "api")
        echo "🌐 运行 API 测试（真实数据）..."
        echo "⚠️  警告: 这些测试依赖外部服务，可能较慢或不稳定"
        uv run pytest tests/api/ -v
        ;;
    "fast")
        echo "⚡ 运行快速测试（单元 + 集成）..."
        uv run pytest -m "not slow" -v
        ;;
    "coverage")
        echo "📊 运行测试并生成覆盖率报告..."
        uv run pytest --cov=app --cov-report=html --cov-report=term -v
        echo ""
        echo "✅ 覆盖率报告已生成: htmlcov/index.html"
        ;;
    "all")
        echo "🎯 运行所有测试..."
        uv run pytest -v
        ;;
    *)
        echo "⚡ 运行快速测试（默认）..."
        uv run pytest -m "not slow" -v
        ;;
esac

echo ""
echo "✅ 测试完成！"
