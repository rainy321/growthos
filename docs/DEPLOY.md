# Growth OS 部署指南

Growth OS 由静态导出的 Next.js 前端和 FastAPI 后端组成。前端内置离线完整演示，因此即使后端未部署，评委和用户也能体验核心闭环；真实注册与跨设备数据仍需要后端。

## 推荐组合

| 部分 | 推荐平台 | 说明 |
|---|---|---|
| 前端 | Vercel 或 Netlify | 仓库根目录选择 `frontend`，构建命令 `npm run build` |
| 后端 | Render / Railway / Fly.io | 需要 Python Web 服务；保存真实用户数据时必须配置持久磁盘 |

## 1. 部署后端

仓库包含 `render.yaml`，可在 Render 通过 Blueprint 导入。手动创建时使用：

- Root Directory：`backend`
- Build Command：`pip install -r requirements.txt`
- Start Command：`uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health Check：`/api/health`

生产环境变量：

| 变量 | 要求 |
|---|---|
| `SESSION_SECRET` | 必填，至少 32 位随机字符串 |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | 前端完整来源，如 `https://growthos.example.com`；多个来源用逗号分隔 |
| `GLM_API_KEY` | 建议填写；不填时 AI 使用结构化演示输出 |
| `GLM_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` |
| `GLM_MODEL` | `glm-4-flashx` 或可用模型 |
| `SEED_DEMO_DATA` | 生产环境建议 `0` |
| `DATABASE_PATH` | 持久磁盘中的文件路径，例如 `/var/data/growth_os.db` |

部署后访问 `https://<后端域名>/api/health`，应看到版本号和 `ai_mode`。

> 没有持久磁盘时，SQLite 会在重新部署后丢失。比赛演示可依赖浏览器离线演示；真实用户版本必须使用持久磁盘或迁移到 PostgreSQL。

## 2. 部署前端

### Vercel

1. 导入 `rainy321/growthos`。
2. Root Directory 选择 `frontend`。
3. 设置 `NEXT_PUBLIC_API_BASE=https://<后端域名>`。
4. 部署并把前端域名加入后端 `CORS_ORIGINS`，然后重新部署后端。

### Netlify

仓库中的 `frontend/netlify.toml` 已配置静态导出。和 Vercel 一样设置 `NEXT_PUBLIC_API_BASE` 为真实后端地址，并把 Netlify 域名加入后端 `CORS_ORIGINS`。

## 3. 上线验证

1. 打开前端，确认“进入离线完整演示”可直接使用。
2. 注册一个新账号，确认密码少于 8 位会被拒绝。
3. 创建目标、生成任务、打卡、复盘并保存洞察。
4. 退出后重新登录，确认数据仍在。
5. 用第二个账号确认无法读取第一个账号的目标。
6. 手机尺寸下检查底部导航、对话面板和表单。

## 4. 本地运行

```bash
# 后端
python -m pip install -r backend/requirements.txt
copy backend\.env.example backend\.env
python -m uvicorn main:app --app-dir backend --port 8000

# 前端
cd frontend
npm ci
copy .env.example .env.local
npm run dev
```
