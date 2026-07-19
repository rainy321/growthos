import { beginDemo, demoApi, endDemo, isDemoMode, resetDemo } from "./demo-store";

const BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = "REQUEST_FAILED" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function token() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem("growthos_token") || "";
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token()) headers.Authorization = `Bearer ${token()}`;

  let response;
  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("服务响应超时。你可以稍后重试，或直接进入离线演示。", { code: "TIMEOUT" });
    }
    throw new ApiError("暂时连接不到 Growth OS 服务。检查后端地址，或使用离线演示继续体验。", { code: "OFFLINE" });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail = response.status === 401 ? "登录已过期，请重新登录" : `请求失败（${response.status}）`;
    try {
      const payload = await response.json();
      if (typeof payload.detail === "string") detail = payload.detail;
      if (Array.isArray(payload.detail)) detail = payload.detail.map((item) => item.msg).join("；");
    } catch (_) {}
    throw new ApiError(detail, { status: response.status, code: response.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR" });
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const q = encodeURIComponent;
const remoteApi = {
  health: () => request("/api/health", { auth: false }),
  users: () => request("/api/users"),
  dashboard: (uid) => request(`/api/dashboard?user_id=${q(uid)}`),
  tasks: (uid) => request(`/api/tasks?user_id=${q(uid)}`),
  goals: (uid) => request(`/api/goals?user_id=${q(uid)}`),
  memory: (uid) => request(`/api/memory?user_id=${q(uid)}`),
  checkin: (tid, body) => request(`/api/tasks/${q(tid)}/checkin`, { method: "POST", body }),
  createGoal: (body) => request("/api/goals", { method: "POST", body }),
  deleteGoal: (gid) => request(`/api/goals/${q(gid)}`, { method: "DELETE" }),
  completeGoal: (gid) => request(`/api/goals/${q(gid)}/complete`, { method: "POST" }),
  checkDue: (uid, date) => request("/api/goals/check-due", { method: "POST", body: { user_id: uid, date } }),
  planToday: (gid, date) => request(`/api/goals/${q(gid)}/plan`, { method: "POST", body: date ? { date } : {} }),
  updateUser: (uid, body) => request(`/api/users/${q(uid)}`, { method: "PUT", body }),
  addTask: (body) => request("/api/tasks", { method: "POST", body }),
  updateTask: (tid, body) => request(`/api/tasks/${q(tid)}`, { method: "PUT", body }),
  deleteTask: (tid) => request(`/api/tasks/${q(tid)}`, { method: "DELETE" }),
  analysis: (uid) => request(`/api/analysis?user_id=${q(uid)}`),
  adjust: (uid, insights) => request(`/api/adjust?user_id=${q(uid)}`, { method: "POST", body: { insights } }),
  saveInsights: (uid, insights) => request(`/api/analysis/save?user_id=${q(uid)}`, { method: "POST", body: { insights } }),
  register: (body) => request("/api/auth/register", { method: "POST", body, auth: false }),
  login: (body) => request("/api/auth/login", { method: "POST", body, auth: false }),
};

function route(name) {
  return (...args) => (isDemoMode() ? demoApi[name](...args) : remoteApi[name](...args));
}

export const api = {
  health: route("health"),
  users: route("users"),
  dashboard: route("dashboard"),
  tasks: route("tasks"),
  goals: route("goals"),
  memory: route("memory"),
  checkin: route("checkin"),
  createGoal: route("createGoal"),
  deleteGoal: route("deleteGoal"),
  completeGoal: route("completeGoal"),
  checkDue: route("checkDue"),
  planToday: route("planToday"),
  updateUser: route("updateUser"),
  addTask: route("addTask"),
  updateTask: route("updateTask"),
  deleteTask: route("deleteTask"),
  analysis: route("analysis"),
  adjust: route("adjust"),
  saveInsights: route("saveInsights"),
  register: remoteApi.register,
  login: remoteApi.login,
  isDemo: isDemoMode,
  startDemo: beginDemo,
  stopDemo: endDemo,
  resetDemo,
};
