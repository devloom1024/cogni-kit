---
allowed-tools: Bash(curl:*)
description: 下载 LLM 参考文档
---

# 下载 LLM 参考文档

## 目标
下载 `.agents/reference/llm/index.md` 中列出的所有 LLM 参考文档到 `.agents/reference/llm/` 目录。

## 操作步骤

1. 读取 `.agents/reference/llm/index.md` 获取所有 URL
2. 使用 `curl -fsSL` 下载每个文件
3. 保存到 `.agents/reference/llm/` 目录，文件名从 URL 中提取
4. 如果文件已存在，使用 `-o` 参数覆盖下载



## 示例命令

```bash
# 下载单个文件
curl -fsSL -o .agents/reference/llm/claude-code-docs-llm.txt https://code.claude.com/docs/llms.txt

# 下载单个文件（覆盖已存在）
curl -fsSL -o .agents/reference/llm/shadcn-docs-llm.txt https://ui.shadcn.com/llms.txt
```

## 验证
- 确认文件已下载：检查 `.agents/reference/llm/` 目录
- 验证文件大小：确认下载的文件不为空
