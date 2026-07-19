# Growth OS

> 让长期目标持续抵达：把方向导航成今天能完成的航点，再根据真实执行信号持续重规划。

[![Quality gate](https://github.com/rainy321/growthos/actions/workflows/quality.yml/badge.svg)](https://github.com/rainy321/growthos/actions/workflows/quality.yml)

Growth OS 不是另一个 Todo List。普通任务工具记录“做没做”，Growth OS 进一步回答：计划为什么偏航、怎样调整才更适合这个人、哪些规律值得被系统长期记住。

## 现在能做什么

- **长期目标拆解**：把模糊方向拆成阶段、能力和可验证行动。
- **每日航线**：根据目标与现实基础生成当天任务，也允许手动修订。
- **行为信号**：记录完成质量和未完成原因，而不只记录勾选状态。
- **AI 重规划**：分析近 7 天行为，调整难度、时段与任务边界。
- **导航记忆**：把高效时段、常见阻力和有效策略沉淀为长期上下文。
- **离线完整演示**：后端未部署或休眠时仍可体验全部核心流程，数据保存在浏览器。
- **自适应界面**：桌面与移动端均可使用，支持键盘焦点与减少动态效果。

## 产品闭环

```text
长期方向 → 阶段拆解 → 今日航点 → 行为信号 → 偏航洞察 → 重新导航
    ↑                                                        ↓
    └────────────────────── 导航记忆 ────────────────────────┘
```

## 技术结构

- 前端：Next.js 16、React 19、Tailwind CSS 4
- 后端：FastAPI、SQLite
- AI：智谱 GLM（OpenAI 兼容协议）；无 Key 时使用结构化演示输出
- 安全：PBKDF2 密码哈希、带过期时间的签名会话、用户级资源隔离、可配置 CORS
- 质量门：后端单元/接口测试，GitHub Actions 前后端构建检查

## 本地运行

要求：Node.js 22+、Python 3.12+。

```bash
# 后端
python -m pip install -r backend/requirements.txt
copy backend\.env.example backend\.env
python -m uvicorn main:app --app-dir backend --reload --port 8000

# 前端（另开终端）
cd frontend
npm ci
copy .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。如果不想配置后端，直接选择“进入离线完整演示”。

## 环境变量

后端：

| 变量 | 用途 |
|---|---|
| `SESSION_SECRET` | 生产环境必填，签名登录会话，建议至少 32 位随机值 |
| `CORS_ORIGINS` | 允许访问 API 的前端域名，多个域名用逗号分隔 |
| `GLM_API_KEY` | 智谱 API Key；不填则使用演示 AI 输出 |
| `GLM_BASE_URL` / `GLM_MODEL` | 模型服务地址与模型名 |
| `DATABASE_PATH` | SQLite 文件位置；生产环境应指向持久磁盘 |
| `SEED_DEMO_DATA` | `1` 时向空库写入演示账号；生产环境建议为 `0` |

前端：

| 变量 | 用途 |
|---|---|
| `NEXT_PUBLIC_API_BASE` | 后端公开地址；使用 Netlify 同源代理时可以留空 |

更完整的上线步骤见 [docs/DEPLOY.md](docs/DEPLOY.md)，发行前检查见 [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)。

## 验证

```bash
python -m unittest discover -s backend/tests -v
cd frontend
npm run lint
npm run build
```

## License

MIT
