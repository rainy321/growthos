import assert from "node:assert/strict";
import test from "node:test";


class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.window = { localStorage: new MemoryStorage() };

const { beginDemo, demoApi, isDemoMode, resetDemo } = await import("../lib/demo-store.js");

test("offline demo starts with a usable adaptive route", async () => {
  const user = beginDemo();
  assert.equal(isDemoMode(), true);
  const [goals, tasks, dashboard, memory] = await Promise.all([
    demoApi.goals(user.id),
    demoApi.tasks(user.id),
    demoApi.dashboard(user.id),
    demoApi.memory(user.id),
  ]);
  assert.ok(goals.some((goal) => goal.status === "active"));
  assert.ok(tasks.length >= 4);
  assert.ok(dashboard.total > 0);
  assert.ok(memory.length > 0);
});

test("check-ins immediately update the dashboard", async () => {
  const user = resetDemo();
  const task = (await demoApi.tasks(user.id)).find((item) => item.status === "pending");
  const before = await demoApi.dashboard(user.id);
  await demoApi.checkin(task.id, { done: true, quality: 5, notes: "测试完成" });
  const after = await demoApi.dashboard(user.id);
  assert.equal(after.done, before.done + 1);
});

test("a new goal can be planned without a backend", async () => {
  const user = resetDemo();
  const goal = await demoApi.createGoal({
    user_id: user.id,
    title: "六周完成作品集",
    category: "创作",
    time_horizon: "6周",
    start_date: "2026-07-19",
  });
  assert.equal(goal.decomposition.phases.length, 3);
  const result = await demoApi.planToday(goal.id, "2026-07-19");
  assert.equal(result.tasks.length, 3);
  assert.ok((await demoApi.tasks(user.id)).some((item) => item.goal_id === goal.id));
});
