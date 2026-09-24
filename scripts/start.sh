#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.server.pid"
LOG_FILE="$PROJECT_DIR/.server.log"
PORT=3000

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "服务已在运行 (PID: $PID, Port: $PORT)"
    echo "访问: http://localhost:$PORT"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

echo "正在启动..."

cd "$PROJECT_DIR"
npm run build > "$LOG_FILE" 2>&1

# 组装 standalone 运行时（next.config output: 'standalone'，静态资源需手动拷入）
rm -rf "$PROJECT_DIR/.next/standalone/.next/static"
mkdir -p "$PROJECT_DIR/.next/standalone/.next"
cp -R "$PROJECT_DIR/.next/static" "$PROJECT_DIR/.next/standalone/.next/static"
if [ -d "$PROJECT_DIR/public" ]; then
  rm -rf "$PROJECT_DIR/.next/standalone/public"
  cp -R "$PROJECT_DIR/public" "$PROJECT_DIR/.next/standalone/public"
fi

cd "$PROJECT_DIR/.next/standalone"
PORT="$PORT" HOSTNAME=0.0.0.0 node server.js >> "$LOG_FILE" 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"

sleep 2

if kill -0 "$PID" 2>/dev/null; then
  echo "✓ 服务已启动 (PID: $PID, Port: $PORT)"
  echo "  日志: $LOG_FILE"
  echo "  访问: http://localhost:$PORT"
  echo "  停止: ./scripts/stop.sh"
else
  echo "✗ 启动失败，查看日志: $LOG_FILE"
  rm -f "$PID_FILE"
  exit 1
fi
