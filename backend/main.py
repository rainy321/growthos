# -*- coding: utf-8 -*-
"""Growth OS API(FastAPI)。
启动:  uvicorn main:app --app-dir backend --reload --port 8000
文档:  http://localhost:8000/docs
"""
from contextlib import asynccontextmanager
from datetime import date
import os
from uuid import uuid4

from fastapi import Body, Depends, FastAPI, Header, HTTPException, Query

import db
import crud
import schemas
import ai_adapter
import auth
import seed

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app):
    # 建表 IF NOT EXISTS + 迁移补列;幂等,每次启动都安全执行
    db.init_db()
    if os.environ.get("SEED_DEMO_DATA", "").lower() in ("1", "true", "yes"):
        seed.seed_demo_if_empty()
        crud.ensure_demo_passwords()
    yield


app = FastAPI(title="Growth OS API", version="1.0.0-rc.1", lifespan=lifespan)
_origins = [
    value.strip()
    for value in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if value.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_user_id(authorization: str | None = Header(default=None)) -> str:
    """Resolve and validate a Bearer session token."""
    token = authorization[7:].strip() if authorization and authorization.lower().startswith("bearer ") else None
    uid = auth.verify_token(token)
    if not uid or not crud.get_user(uid):
        raise HTTPException(401, "登录已过期，请重新登录", headers={"WWW-Authenticate": "Bearer"})
    return uid


def require_same_user(requested: str | None, current: str) -> str:
    if requested and requested != current:
        raise HTTPException(403, "无权访问其他用户的数据")
    return current


def require_goal_owner(goal_id: str, current: str):
    goal = crud.get_goal(goal_id)
    if not goal:
        raise HTTPException(404, "goal not found")
    if goal["user_id"] != current:
        raise HTTPException(403, "无权访问该目标")
    return goal


def require_task_owner(task_id: str, current: str):
    task = crud.get_task(task_id)
    if not task:
        raise HTTPException(404, "task not found")
    require_goal_owner(task["goal_id"], current)
    return task


@app.get("/")
def root():
    return {"name": "Growth OS API", "status": "ok", "version": app.version, "docs": "/docs"}


@app.get("/api/health")
def health():
    cfg = ai_adapter.get_config()
    return {"status": "ok", "version": app.version, "ai_mode": "mock" if cfg["mock"] or not cfg["api_key"] else "live"}


# ---------------- users ----------------
@app.get("/api/users")
def api_users(uid: str = Depends(current_user_id)):
    return [crud.get_user(uid)]


@app.post("/api/auth/register")
def api_register(p: dict = Body(...)):
    name = (p.get("name") or "").strip()
    password = p.get("password") or ""
    if len(name) < 2 or len(name) > 40:
        raise HTTPException(400, "用户名需要 2–40 个字符")
    if len(password) < 8:
        raise HTTPException(400, "密码至少需要 8 个字符")
    baseline = (p.get("baseline") or "").strip()[:500]
    u = crud.register_user(name, baseline, password)
    if not u:
        raise HTTPException(409, "该用户名已被占用")
    return {**u, "token": auth.create_token(u["id"])}


@app.post("/api/auth/login")
def api_login(p: dict = Body(...)):
    u = crud.login_user((p.get("name") or "").strip(), p.get("password") or "")
    if not u:
        raise HTTPException(401, "用户名或密码错误")
    return {**u, "token": auth.create_token(u["id"])}


@app.post("/api/users")
def api_create_user(body: schemas.UserCreate, uid: str = Depends(current_user_id)):
    # Kept for backwards compatibility; authenticated clients may only update
    # their existing profile through PUT /api/users/{uid}.
    raise HTTPException(410, "请使用注册接口创建账号")


@app.put("/api/users/{uid}")
def api_update_user(uid: str, p: dict = Body(...), current: str = Depends(current_user_id)):
    """更新用户资料:baseline / tone / name。"""
    require_same_user(uid, current)
    baseline = p.get("baseline")
    if baseline is not None:
        baseline = str(baseline).strip()[:500]
    tone = p.get("tone")
    if tone is not None and tone not in ("温暖朋友", "严格教练", "幽默伙伴"):
        raise HTTPException(400, "不支持的陪伴语气")
    u = crud.update_user(uid, None, baseline, tone)
    if not u:
        raise HTTPException(404, "user not found")
    return u


@app.get("/api/users/{uid}")
def api_user(uid: str, current: str = Depends(current_user_id)):
    require_same_user(uid, current)
    u = crud.get_user(uid)
    if not u:
        raise HTTPException(404, "user not found")
    return u


# ---------------- goals ----------------
@app.get("/api/goals")
def api_goals(user_id: str | None = Query(None), current: str = Depends(current_user_id)):
    return crud.list_goals(require_same_user(user_id, current))


@app.get("/api/goals/{gid}")
def api_goal(gid: str, current: str = Depends(current_user_id)):
    return require_goal_owner(gid, current)


@app.delete("/api/goals/{gid}")
def api_delete_goal(gid: str, current: str = Depends(current_user_id)):
    """删除目标(及其任务/日志),从每日生成池子移除。"""
    require_goal_owner(gid, current)
    crud.delete_goal(gid)
    return {"deleted": True}


@app.post("/api/goals/{gid}/complete")
def api_complete_goal(gid: str, current: str = Depends(current_user_id)):
    """标记目标完成(移入成就池,不再每天生成)。"""
    require_goal_owner(gid, current)
    g = crud.complete_goal(gid)
    if not g:
        raise HTTPException(404, "goal not found")
    return g


@app.post("/api/goals/check-due")
def api_check_due(p: dict = Body(...), current: str = Depends(current_user_id)):
    """检查并自动完成到期目标,返回本次刚完成的(前端用于弹窗提醒)。"""
    user_id = require_same_user(p.get("user_id"), current)
    newly = crud.complete_due_goals(user_id,
                                    p.get("date") or date.today().isoformat())
    return {"newly_completed": newly}


@app.post("/api/goals")
def api_create_goal(body: schemas.GoalCreate, current: str = Depends(current_user_id)):
    """创建目标 → 自动调 Goal Decomposer → 拆解结果存进 goal.decomposition。"""
    require_same_user(body.user_id, current)
    gid = f"goal_{uuid4().hex[:8]}"
    user = crud.get_user(body.user_id)
    baseline = (user or {}).get("baseline", "")
    # 把类别带进 AI(让不同类别拆解有差异);存库的标题保持干净
    ai_goal = f"{body.title}（类别:{body.category}）" if body.category else body.title
    decomp = ai_adapter.goal_decomposer(ai_goal, body.time_horizon or "", baseline)
    return crud.create_goal(gid, body.user_id, body.title, body.category,
                            body.time_horizon, body.status, decomp,
                            start_date=body.start_date or date.today().isoformat())


@app.post("/api/goals/{gid}/plan")
def api_plan_goal(gid: str, p: dict = Body(default={}), current: str = Depends(current_user_id)):
    """根据目标拆解的【第一阶段】调 Daily Planner → 生成任务入库。
    body 可带 date(YYYY-MM-DD),用于演示模式的模拟日期;缺省用真实今天。"""
    require_goal_owner(gid, current)
    info = crud.plan_inputs(gid)
    if not info:
        raise HTTPException(400, "目标不存在或尚未拆解,无法生成任务")
    plan = ai_adapter.daily_planner(
        gid, info["phase"].get("name", ""), [], info["baseline"],
        goal=info["goal"]["title"],
        phase_tasks=info["phase"].get("tasks", []))
    day = p.get("date") or date.today().isoformat()
    tasks = crud.insert_tasks(gid, plan.get("tasks", []), day)
    return {"goal_id": gid, "phase": info["phase"].get("name", ""),
            "date": day, "tasks": tasks}


# ---------------- tasks ----------------
@app.get("/api/tasks")
def api_tasks(
    goal_id: str | None = Query(None),
    date: str | None = Query(None),
    user_id: str | None = Query(None),
    current: str = Depends(current_user_id),
):
    if goal_id:
        require_goal_owner(goal_id, current)
    return crud.list_tasks(goal_id, date, require_same_user(user_id, current))


@app.get("/api/tasks/{tid}")
def api_task(tid: str, current: str = Depends(current_user_id)):
    return require_task_owner(tid, current)


@app.post("/api/tasks/{tid}/checkin")
def api_checkin(tid: str, body: schemas.CheckIn, current: str = Depends(current_user_id)):
    require_task_owner(tid, current)
    log = crud.checkin(tid, body.done, body.quality, body.notes)
    if log is None:
        raise HTTPException(404, "task not found")
    return log


@app.post("/api/tasks")
def api_create_task(p: dict = Body(...), current: str = Depends(current_user_id)):
    """用户新增自己的任务。"""
    gid = p.get("goal_id")
    if not gid:
        raise HTTPException(400, "需要有效的 goal_id")
    require_goal_owner(gid, current)
    content = (p.get("content") or "").strip()
    if not content or len(content) > 240:
        raise HTTPException(400, "任务内容需要 1–240 个字符")
    difficulty = p.get("difficulty", "中")
    if difficulty not in ("低", "中", "高"):
        raise HTTPException(400, "任务难度只能是低、中或高")
    return crud.create_task(gid, p.get("date") or date.today().isoformat(),
                            content, difficulty)


@app.put("/api/tasks/{tid}")
def api_update_task(tid: str, p: dict = Body(...), current: str = Depends(current_user_id)):
    require_task_owner(tid, current)
    content = p.get("content")
    if content is not None:
        content = str(content).strip()
        if not content or len(content) > 240:
            raise HTTPException(400, "任务内容需要 1–240 个字符")
    difficulty = p.get("difficulty")
    if difficulty is not None and difficulty not in ("低", "中", "高"):
        raise HTTPException(400, "任务难度只能是低、中或高")
    status = p.get("status")
    if status is not None and status not in ("pending", "completed", "skipped"):
        raise HTTPException(400, "不支持的任务状态")
    t = crud.update_task(tid, content, difficulty, status)
    if not t:
        raise HTTPException(404, "task not found")
    return t


@app.delete("/api/tasks/{tid}")
def api_delete_task(tid: str, current: str = Depends(current_user_id)):
    require_task_owner(tid, current)
    return {"deleted": crud.delete_task(tid)}


# ---------------- behavior logs ----------------
@app.get("/api/logs")
def api_logs(
    task_id: str | None = Query(None),
    user_id: str | None = Query(None),
    current: str = Depends(current_user_id),
):
    if task_id:
        require_task_owner(task_id, current)
    return crud.list_logs(task_id, require_same_user(user_id, current))


# ---------------- memory ----------------
@app.get("/api/memory")
def api_memory(user_id: str | None = Query(None), current: str = Depends(current_user_id)):
    return crud.list_memory(require_same_user(user_id, current))


# ---------------- 反馈系统:分析 / 调整 / 沉淀 ----------------
@app.get("/api/analysis")
def api_analysis(user_id: str = Query(...), current: str = Depends(current_user_id)):
    """近 7 天行为 → Behavior Analyst → 规律/障碍/洞察。"""
    require_same_user(user_id, current)
    logs, rate = crud.recent_logs(user_id)
    if not logs:
        return {"completion_rate_7d": 0, "logs_count": 0, "insights": []}
    res = ai_adapter.behavior_analyst(logs)
    return {"completion_rate_7d": rate, "logs_count": len(logs),
            "insights": res.get("insights", [])}


@app.post("/api/adjust")
def api_adjust(user_id: str = Query(...), p: dict = Body(default={}), current: str = Depends(current_user_id)):
    """完成率 + 洞察 + 当前任务 → System Adjuster → 动态调整建议。"""
    require_same_user(user_id, current)
    logs, rate = crud.recent_logs(user_id)
    insights = p.get("insights")
    if insights is None:
        insights = (ai_adapter.behavior_analyst(logs).get("insights", [])
                    if logs else [])
    current = crud.current_pending_tasks(user_id)
    res = ai_adapter.system_adjuster(rate, insights, current)
    return {"completion_rate_7d": rate, "current_tasks": current,
            "adjustments": res.get("adjustments", res)}


@app.post("/api/analysis/save")
def api_save_analysis(user_id: str = Query(...), p: dict = Body(...), current: str = Depends(current_user_id)):
    """把分析洞察写入 memory(复利沉淀)。"""
    require_same_user(user_id, current)
    insights = p.get("insights", [])
    for ins in insights:
        crud.add_memory(user_id, ins.get("insight_type", "洞察"),
                        ins.get("content", ""))
    return {"saved": len(insights)}


# ---------------- dashboard ----------------
@app.get("/api/dashboard")
def api_dashboard(user_id: str = Query(...), current: str = Depends(current_user_id)):
    require_same_user(user_id, current)
    d = crud.dashboard(user_id)
    if d is None:
        raise HTTPException(404, "user not found")
    return d


# ---------------- AI(4 个 Prompt 函数)----------------
@app.post("/api/ai/decompose")
def ai_decompose(p: dict = Body(...), current: str = Depends(current_user_id)):
    return ai_adapter.goal_decomposer(
        p.get("goal", ""), p.get("time_horizon", ""), p.get("user_baseline", ""))


@app.post("/api/ai/plan")
def ai_plan(p: dict = Body(...), current: str = Depends(current_user_id)):
    return ai_adapter.daily_planner(
        p.get("goal_id", ""), p.get("phase", ""),
        p.get("yesterday_tasks", []), p.get("user_baseline", ""))


@app.post("/api/ai/analyze")
def ai_analyze(p: dict = Body(...), current: str = Depends(current_user_id)):
    return ai_adapter.behavior_analyst(p.get("logs", []))


@app.post("/api/ai/adjust")
def ai_adjust(p: dict = Body(...), current: str = Depends(current_user_id)):
    return ai_adapter.system_adjuster(
        p.get("completion_rate_7d", 0), p.get("insights", []),
        p.get("current_tasks", []))
