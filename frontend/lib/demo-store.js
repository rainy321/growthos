const STORE_KEY = "growthos_demo_v1";
const MODE_KEY = "growthos_mode";

function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function shiftDay(iso, amount) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function initialState() {
  const today = todayISO();
  const user = {
    id: "demo_user",
    name: "林知远",
    baseline: "产品经理，每天可稳定投入 90 分钟；容易把计划排得过满，晚间精力较低。",
    tone: "温暖朋友",
  };
  const goals = [
    {
      id: "goal_output",
      user_id: user.id,
      title: "90 天建立稳定的深度工作与输出系统",
      category: "工作",
      time_horizon: "90天",
      status: "active",
      created_at: shiftDay(today, -18),
      decomposition: {
        long_term_skills: ["注意力管理", "稳定输出", "复盘校准"],
        phases: [
          { name: "建立航线", duration: "2周", tasks: ["固定每日专注时段", "记录中断原因"] },
          { name: "提升巡航", duration: "6周", tasks: ["完成每周可交付成果", "压缩低价值切换"] },
          { name: "形成系统", duration: "4周", tasks: ["沉淀模板", "建立复盘与调整节奏"] },
        ],
      },
    },
    {
      id: "goal_energy",
      user_id: user.id,
      title: "恢复稳定体能与睡眠节奏",
      category: "健康",
      time_horizon: "8周",
      status: "active",
      created_at: shiftDay(today, -12),
      decomposition: {
        long_term_skills: ["能量管理", "低阻力习惯"],
        phases: [
          { name: "固定锚点", duration: "2周", tasks: ["固定起床时间", "睡前离屏 20 分钟"] },
          { name: "渐进负荷", duration: "6周", tasks: ["每周三次轻运动", "根据疲劳调整强度"] },
        ],
      },
    },
  ];

  const tasks = [];
  const logs = [];
  const history = [
    ["完成最重要的一页方案", "工作", true, 4, "上午很顺，关掉消息后效率明显提高"],
    ["整理用户访谈结论", "工作", true, 5, "先写结论再补证据，推进很快"],
    ["睡前散步 20 分钟", "健康", false, 2, "临时加班，回家太晚"],
    ["完成产品流程草图", "工作", true, 4, "下午容易分心，但番茄钟有效"],
    ["力量训练 25 分钟", "健康", false, 2, "计划强度太高，改成拉伸更现实"],
    ["写完比赛展示讲稿", "工作", true, 5, "早上第一小时最适合输出"],
  ];
  history.forEach(([content, category, done, quality, notes], index) => {
    const taskId = `history_${index}`;
    const day = shiftDay(today, index - history.length);
    tasks.push({
      id: taskId,
      goal_id: category === "工作" ? "goal_output" : "goal_energy",
      date: day,
      content,
      difficulty: quality >= 4 ? "中" : "低",
      status: done ? "completed" : "skipped",
    });
    logs.push({ id: `log_${index}`, task_id: taskId, date: day, done: done ? 1 : 0, quality, notes });
  });

  tasks.push(
    { id: "today_1", goal_id: "goal_output", date: today, content: "关闭通知，完成 45 分钟核心方案写作", difficulty: "中", status: "completed" },
    { id: "today_2", goal_id: "goal_output", date: today, content: "把方案压缩成一页可讲清的路线图", difficulty: "高", status: "pending" },
    { id: "today_3", goal_id: "goal_energy", date: today, content: "晚饭后散步 20 分钟", difficulty: "低", status: "pending" },
    { id: "today_4", goal_id: "goal_output", date: today, content: "睡前记录今天最有效的工作条件", difficulty: "低", status: "pending" },
  );
  logs.push({ id: "log_today_1", task_id: "today_1", date: today, done: 1, quality: 4, notes: "第一小时没有打开聊天软件" });

  return {
    user,
    goals,
    tasks,
    logs,
    memory: [
      { id: "mem_1", user_id: user.id, insight_type: "高效时段", content: "上午第一小时的高认知任务完成质量最高，应作为固定航线。" },
      { id: "mem_2", user_id: user.id, insight_type: "偏航原因", content: "晚间失败主要来自任务强度过高，不是目标意愿不足。" },
      { id: "mem_3", user_id: user.id, insight_type: "有效策略", content: "先写结论、再补证据，能显著降低启动阻力。" },
    ],
  };
}

function readState() {
  if (typeof window === "undefined") return initialState();
  try {
    const saved = window.localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.user && Array.isArray(parsed.goals) && Array.isArray(parsed.tasks) && Array.isArray(parsed.logs) && Array.isArray(parsed.memory)) return parsed;
    }
  } catch (_) {}
  const state = initialState();
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
  return state;
}

function writeState(state) {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  return state;
}

function userGoals(state, uid) {
  return state.goals.filter((goal) => goal.user_id === uid);
}

function userTasks(state, uid) {
  const goalIds = new Set(userGoals(state, uid).map((goal) => goal.id));
  return state.tasks.filter((task) => goalIds.has(task.goal_id));
}

function buildDashboard(state, uid) {
  const user = state.user.id === uid ? state.user : null;
  if (!user) throw new Error("演示用户不存在");
  const tasks = userTasks(state, uid);
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const goalMap = new Map(userGoals(state, uid).map((goal) => [goal.id, goal]));
  const logs = state.logs.filter((log) => taskMap.has(log.task_id));
  const done = logs.filter((log) => log.done).length;
  const qualities = logs.map((log) => Number(log.quality)).filter(Number.isFinite);
  const categories = new Map();
  logs.forEach((log) => {
    const task = taskMap.get(log.task_id);
    const category = goalMap.get(task.goal_id)?.category || "其他";
    const current = categories.get(category) || { category, done: 0, total: 0 };
    current.total += 1;
    current.done += log.done ? 1 : 0;
    categories.set(category, current);
  });
  const dated = logs.filter((log) => log.date).sort((a, b) => a.date.localeCompare(b.date));
  const maxDate = dated.at(-1)?.date || todayISO();
  const recentStart = shiftDay(maxDate, -6);
  const recent = dated.filter((log) => log.date >= recentStart);
  const recentDone = recent.filter((log) => log.done).length;
  const doneDates = [...new Set(dated.filter((log) => log.done).map((log) => log.date))].sort().reverse();
  let streak = 0;
  let cursor = doneDates[0];
  doneDates.forEach((day) => {
    if (day === cursor) {
      streak += 1;
      cursor = shiftDay(cursor, -1);
    }
  });
  return {
    user,
    completion_rate: logs.length ? done / logs.length : 0,
    streak,
    total: logs.length,
    done,
    avg_quality: qualities.length ? Math.round((qualities.reduce((a, b) => a + b, 0) / qualities.length) * 10) / 10 : 0,
    categories: [...categories.values()].map((item) => ({ ...item, rate: item.done / item.total })),
    recent_7d: { rate: recent.length ? recentDone / recent.length : 0, done: recentDone, total: recent.length, to: maxDate },
  };
}

function decomposeGoal(title, horizon, category) {
  return {
    long_term_skills: ["稳定执行", `${category || "目标"}专项能力`, "复盘校准"],
    phases: [
      { name: "建立航线", duration: "第 1–2 周", tasks: [`定义「${title}」的最小成功标准`, "固定每天的启动时段"] },
      { name: "稳定巡航", duration: horizon || "中期", tasks: ["每周交付一个可验证成果", "记录偏航原因并降低阻力"] },
      { name: "校准抵达", duration: "最后阶段", tasks: ["用真实结果检查差距", "保留有效策略并形成复用模板"] },
    ],
  };
}

export function isDemoMode() {
  return typeof window !== "undefined" && window.localStorage.getItem(MODE_KEY) === "demo";
}

export function beginDemo() {
  if (typeof window === "undefined") return initialState().user;
  window.localStorage.setItem(MODE_KEY, "demo");
  const state = readState();
  return state.user;
}

export function endDemo() {
  if (typeof window !== "undefined") window.localStorage.removeItem(MODE_KEY);
}

export function resetDemo() {
  const state = initialState();
  writeState(state);
  return state.user;
}

export const demoApi = {
  health: async () => ({ status: "ok", version: "demo", ai_mode: "demo" }),
  users: async () => [readState().user],
  dashboard: async (uid) => buildDashboard(readState(), uid),
  tasks: async (uid) => userTasks(readState(), uid),
  goals: async (uid) => userGoals(readState(), uid),
  memory: async (uid) => readState().memory.filter((item) => item.user_id === uid),
  checkin: async (taskId, body) => {
    const state = readState();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error("任务不存在或已被删除");
    task.status = body.done ? "completed" : "skipped";
    const previous = state.logs.find((item) => item.task_id === taskId);
    const log = previous || { id: id("log"), task_id: taskId, date: task.date };
    Object.assign(log, { done: body.done ? 1 : 0, quality: body.quality, notes: body.notes || "" });
    if (!previous) state.logs.push(log);
    writeState(state);
    return log;
  },
  createGoal: async (body) => {
    const state = readState();
    const goal = {
      id: id("goal"),
      user_id: body.user_id,
      title: body.title.trim(),
      category: body.category?.trim() || "个人成长",
      time_horizon: body.time_horizon?.trim() || "30天",
      status: "active",
      created_at: body.start_date || todayISO(),
      decomposition: decomposeGoal(body.title.trim(), body.time_horizon, body.category),
    };
    state.goals.unshift(goal);
    writeState(state);
    return goal;
  },
  deleteGoal: async (goalId) => {
    const state = readState();
    const taskIds = new Set(state.tasks.filter((task) => task.goal_id === goalId).map((task) => task.id));
    state.goals = state.goals.filter((goal) => goal.id !== goalId);
    state.tasks = state.tasks.filter((task) => task.goal_id !== goalId);
    state.logs = state.logs.filter((log) => !taskIds.has(log.task_id));
    writeState(state);
    return { deleted: true };
  },
  completeGoal: async (goalId) => {
    const state = readState();
    const goal = state.goals.find((item) => item.id === goalId);
    if (!goal) throw new Error("目标不存在");
    goal.status = "done";
    writeState(state);
    return goal;
  },
  checkDue: async () => ({ newly_completed: [] }),
  planToday: async (goalId, date) => {
    const state = readState();
    const goal = state.goals.find((item) => item.id === goalId);
    if (!goal) throw new Error("目标不存在");
    const targetDate = date || todayISO();
    state.tasks = state.tasks.filter((task) => !(task.goal_id === goalId && task.date === targetDate && task.status === "pending"));
    const planned = [
      { content: `推进「${goal.title}」最关键的一小步（45 分钟）`, difficulty: "中" },
      { content: "完成一个能被别人看见或验证的产出", difficulty: "高" },
      { content: "用 5 分钟记录阻力与下一次调整", difficulty: "低" },
    ].map((item) => ({ ...item, id: id("task"), goal_id: goalId, date: targetDate, status: "pending" }));
    state.tasks.push(...planned);
    writeState(state);
    return { goal_id: goalId, date: targetDate, tasks: planned };
  },
  updateUser: async (uid, body) => {
    const state = readState();
    if (state.user.id !== uid) throw new Error("用户不存在");
    state.user = { ...state.user, ...body, id: uid };
    writeState(state);
    return state.user;
  },
  addTask: async (body) => {
    const state = readState();
    const task = { id: id("task"), goal_id: body.goal_id, date: body.date || todayISO(), content: body.content.trim(), difficulty: body.difficulty || "中", status: "pending" };
    state.tasks.push(task);
    writeState(state);
    return task;
  },
  updateTask: async (taskId, body) => {
    const state = readState();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error("任务不存在");
    Object.assign(task, body);
    writeState(state);
    return task;
  },
  deleteTask: async (taskId) => {
    const state = readState();
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    state.logs = state.logs.filter((log) => log.task_id !== taskId);
    writeState(state);
    return { deleted: true };
  },
  analysis: async (uid) => {
    const state = readState();
    const dash = buildDashboard(state, uid);
    const missed = state.logs.filter((log) => !log.done).map((log) => log.notes).join(" ");
    return {
      completion_rate_7d: dash.recent_7d.rate,
      logs_count: dash.recent_7d.total,
      insights: [
        { insight_type: "高效时段", content: "上午的核心输出完成质量更高，建议把第一小时设为不可打断航段。", confidence: 0.88 },
        { insight_type: "偏航原因", content: /加班|太晚|疲/.test(missed) ? "未完成主要发生在晚间高负荷时段，应降低强度而不是补量。" : "当前偏航更多来自任务边界不清，先定义可交付结果。", confidence: 0.82 },
      ],
    };
  },
  adjust: async () => ({
    adjustments: {
      difficulty_change: "晚间降一档，上午保持",
      tasks_to_reschedule: ["把高认知写作移到上午第一小时", "将晚间复盘压缩为 5 分钟记录"],
      focus_strategy: "每天只设一个必须交付的核心航点；其余任务用于保持连续性。",
      reason: "最近的完成记录显示，时段比意愿更能解释执行质量。",
    },
  }),
  saveInsights: async (uid, insights) => {
    const state = readState();
    insights.forEach((insight) => state.memory.unshift({ id: id("mem"), user_id: uid, insight_type: insight.insight_type || "洞察", content: insight.content || "" }));
    writeState(state);
    return { saved: insights.length };
  },
  register: async () => { throw new Error("演示模式不创建真实账号，请退出演示后注册"); },
  login: async () => { throw new Error("演示模式已登录"); },
};
