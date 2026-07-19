"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { addDay, companionGreeting, companionReply, dayDiff, isoToday } from "./shared";

const GrowthCtx = createContext(null);
export const useGrowth = () => useContext(GrowthCtx);

export function GrowthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [simDate, setSimDate] = useState(isoToday);
  const [dash, setDash] = useState(null);
  const [mem, setMem] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dataStatus, setDataStatus] = useState("idle");
  const [dataError, setDataError] = useState("");
  const [serviceInfo, setServiceInfo] = useState(null);

  const [compOpen, setCompOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newlyCompleted, setNewlyCompleted] = useState([]);

  const uid = me?.id || "";
  const tone = me?.tone || "温暖朋友";
  const dayN = dayDiff(isoToday(), simDate) + 1;
  const isDemo = api.isDemo();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("gos_me");
        const savedDate = window.localStorage.getItem("gos_sim");
        if (saved) setMe(JSON.parse(saved));
        if (savedDate) setSimDate(savedDate);
      } catch (_) {
        window.localStorage.removeItem("gos_me");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const loadAll = useCallback(async (id) => {
    if (!id) return;
    setDataStatus("loading");
    setDataError("");
    try {
      const [dashboard, memory, allTasks] = await Promise.all([
        api.dashboard(id),
        api.memory(id),
        api.tasks(id),
      ]);
      setDash(dashboard);
      setMem(memory || []);
      setTasks(allTasks || []);
      setDataStatus("ready");
    } catch (error) {
      setDataStatus("error");
      setDataError(String(error?.message || error));
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!uid) return;
    api.health().then(setServiceInfo).catch(() => setServiceInfo(null));
    api.checkDue(uid, simDate)
      .then((result) => {
        if (result?.newly_completed?.length) setNewlyCompleted(result.newly_completed);
      })
      .catch(() => {});
    loadAll(uid).catch(() => {});
  }, [uid, simDate, loadAll]);

  const refreshDash = useCallback(async () => {
    if (!uid) return null;
    const result = await api.dashboard(uid);
    setDash(result);
    return result;
  }, [uid]);

  function login(result) {
    const user = result?.user || result;
    const sessionToken = result?.token || user?.token;
    if (!user?.id) throw new Error("登录响应缺少用户信息");
    const cleanUser = { ...user };
    delete cleanUser.token;
    if (sessionToken) window.localStorage.setItem("growthos_token", sessionToken);
    window.localStorage.setItem("gos_me", JSON.stringify(cleanUser));
    setMe(cleanUser);
  }

  function startDemo() {
    const user = api.startDemo();
    window.localStorage.removeItem("growthos_token");
    setSimDate(isoToday());
    window.localStorage.setItem("gos_sim", isoToday());
    login(user);
  }

  function resetDemoData() {
    const user = api.resetDemo();
    setSimDate(isoToday());
    window.localStorage.setItem("gos_sim", isoToday());
    login(user);
    loadAll(user.id).catch(() => {});
  }

  function logout() {
    api.stopDemo();
    window.localStorage.removeItem("gos_me");
    window.localStorage.removeItem("growthos_token");
    window.localStorage.removeItem("gos_sim");
    setMe(null);
    setDash(null);
    setMem([]);
    setTasks([]);
    setDataError("");
    setDataStatus("idle");
    setServiceInfo(null);
    setCompOpen(false);
    setMessages([]);
  }

  function updateMe(user) {
    window.localStorage.setItem("gos_me", JSON.stringify(user));
    setMe(user);
  }

  function fastForward() {
    setSimDate((current) => {
      const next = addDay(current, 1);
      window.localStorage.setItem("gos_sim", next);
      return next;
    });
  }

  function toggleCompanion() {
    setCompOpen((open) => {
      const next = !open;
      if (next && messages.length === 0) {
        setMessages([{ role: "bot", text: companionGreeting(tone, me?.name || "", dayN) }]);
      }
      return next;
    });
  }

  function sendCompanion(text) {
    const value = (text || "").trim();
    if (!value) return;
    setMessages((items) => [...items, { role: "user", text: value }]);
    window.setTimeout(() => {
      setMessages((items) => [...items, { role: "bot", text: companionReply(value, tone, dash) }]);
    }, 350);
  }

  const value = {
    me, uid, tone, dayN, simDate, isDemo,
    dash, mem, tasks, setTasks, loadAll, refreshDash,
    dataStatus, dataError,
    serviceInfo,
    login, logout, updateMe, startDemo, resetDemoData, fastForward,
    compOpen, messages, toggleCompanion, sendCompanion,
    newlyCompleted, clearCelebration: () => setNewlyCompleted([]),
  };

  return <GrowthCtx.Provider value={value}>{children}</GrowthCtx.Provider>;
}
