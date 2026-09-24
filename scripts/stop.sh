#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.server.pid"
PORT=3000

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null
    echo "✓ 已停止服务 (PID: $PID)"
  else
    echo "进程已不存在"
  fi
  rm -f "$PID_FILE"
else
  echo "未找到 PID 文件，尝试按端口查找..."
fi

# 兜底：按端口杀进程
KILLED=$(lsof -ti:"$PORT" 2>/dev/null)
if [ -n "$KILLED" ]; then
  echo "$KILLED" | xargs kill -9 2>/dev/null
  echo "✓ 已终止端口 $PORT 上的残留进程"
fi

echo "服务已停止"
