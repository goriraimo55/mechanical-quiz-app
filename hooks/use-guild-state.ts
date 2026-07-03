"use client";

import { useEffect, useMemo, useState } from "react";
import { badges, evaluations, quests, skills } from "@/data/mock-data";
import type { ApprovalStatus, EvaluationRecord, GuildState, Lesson, Quest, SkillId, TeamQuest } from "@/lib/types";

const STORAGE_KEY = "kosenTechQuestState.v1";
const LEVEL_XP = 500;

const initialSkillXp = skills.reduce(
  (acc, skill) => {
    acc[skill.id] = skill.baseXp;
    return acc;
  },
  {} as Record<SkillId, number>
);

const today = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const yesterdayOf = (dateKey: string) => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}` === dateKey;
};

export const initialGuildState: GuildState = {
  userName: "高専 太郎",
  xp: 1420,
  streak: 8,
  title: "若き設計士",
  badges: ["first-login", "quest-1", "safe-approved"],
  completedLessons: ["l-drawing", "l-measure"],
  completedQuests: ["q-cad-old-drawing"],
  challengedQuests: ["q-cad-old-drawing", "q-measure-report"],
  joinedTeamQuests: [],
  addedQuests: [],
  questApprovals: quests.reduce(
    (acc, quest) => {
      acc[quest.id] = quest.approvalStatus;
      return acc;
    },
    {} as Record<string, ApprovalStatus>
  ),
  teacherComments: {},
  skillXp: initialSkillXp,
  evaluations,
  lastActiveDate: today()
};

export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / LEVEL_XP) + 1;
  const current = xp % LEVEL_XP;
  return {
    level,
    current,
    next: LEVEL_XP,
    progress: Math.round((current / LEVEL_XP) * 100)
  };
}

export function getSkillLevel(xp: number) {
  const level = Math.floor(xp / 140) + 1;
  const current = xp % 140;
  return {
    level,
    progress: Math.round((current / 140) * 100)
  };
}

export function averageCompanyRating(records: EvaluationRecord[]) {
  if (!records.length) return 0;
  const total = records.reduce((sum, record) => {
    const values = Object.values(record.companyToStudent);
    return sum + values.reduce((a, b) => a + b, 0) / values.length;
  }, 0);
  return Math.round((total / records.length) * 10) / 10;
}

export function averageStudentCompanyRating(records: EvaluationRecord[]) {
  if (!records.length) return 0;
  const total = records.reduce((sum, record) => {
    const values = Object.values(record.studentToCompany);
    return sum + values.reduce((a, b) => a + b, 0) / values.length;
  }, 0);
  return Math.round((total / records.length) * 10) / 10;
}

function touchActivity(state: GuildState): GuildState {
  const currentDay = today();
  if (state.lastActiveDate === currentDay) return state;
  return {
    ...state,
    streak: yesterdayOf(state.lastActiveDate) ? state.streak + 1 : 1,
    lastActiveDate: currentDay
  };
}

function addSkillXp(skillXp: Record<SkillId, number>, targetSkills: SkillId[], amount: number) {
  const next = { ...skillXp };
  const gain = Math.max(10, Math.round(amount / Math.max(1, targetSkills.length)));
  targetSkills.forEach((skill) => {
    next[skill] = (next[skill] ?? 0) + gain;
  });
  return next;
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function getUnlockedBadgeIds(state: GuildState) {
  const unlocked = new Set(state.badges);
  if (state.completedLessons.length >= 3) unlocked.add("lesson-3");
  if (state.completedQuests.length >= 1) unlocked.add("quest-1");
  if (state.completedQuests.length >= 3) unlocked.add("quest-3");
  if (state.completedQuests.some((id) => quests.find((quest) => quest.id === id)?.teacherCheckRequired)) {
    unlocked.add("safe-approved");
  }
  if (state.completedQuests.some((id) => quests.find((quest) => quest.id === id)?.rare)) unlocked.add("rare-clear");
  if (state.joinedTeamQuests.length > 0) unlocked.add("team-join");
  if (getSkillLevel(state.skillXp.cad).level >= 4) unlocked.add("cad-rank");
  if (averageCompanyRating(state.evaluations) >= 4.5) unlocked.add("rating-high");
  if (getLevelInfo(state.xp).level >= 5) unlocked.add("level-5");
  return unlocked;
}

export function useGuildState() {
  const [state, setState] = useState<GuildState>(initialGuildState);
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; description: string; levelUp?: boolean } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<GuildState>;
        setState({
          ...initialGuildState,
          ...parsed,
          questApprovals: { ...initialGuildState.questApprovals, ...(parsed.questApprovals ?? {}) },
          skillXp: { ...initialGuildState.skillXp, ...(parsed.skillXp ?? {}) },
          evaluations: parsed.evaluations ?? initialGuildState.evaluations,
          addedQuests: parsed.addedQuests ?? []
        });
      }
    } catch {
      setState(initialGuildState);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const gainXp = (amount: number, targetSkills: SkillId[], title: string, description: string) => {
    setState((prev) => {
      const beforeLevel = getLevelInfo(prev.xp).level;
      const next = touchActivity({
        ...prev,
        xp: prev.xp + amount,
        skillXp: addSkillXp(prev.skillXp, targetSkills, amount)
      });
      const afterLevel = getLevelInfo(next.xp).level;
      setFeedback({
        title: afterLevel > beforeLevel ? `レベル${afterLevel}に到達` : title,
        description: afterLevel > beforeLevel ? `${description} 称号と実績が更新されました。` : description,
        levelUp: afterLevel > beforeLevel
      });
      return next;
    });
  };

  const completeLesson = (lesson: Lesson) => {
    if (state.completedLessons.includes(lesson.id)) {
      setFeedback({ title: "学習済み", description: "この教材の経験値はすでに反映済みです。" });
      return;
    }
    setState((prev) =>
      touchActivity({
        ...prev,
        completedLessons: unique([...prev.completedLessons, lesson.id])
      })
    );
    gainXp(lesson.xp, lesson.skills, "学習完了", `${lesson.title} を完了し、${lesson.xp}XPを獲得しました。`);
  };

  const startQuest = (quest: Quest) => {
    const approval = state.questApprovals[quest.id] ?? quest.approvalStatus;
    if (approval !== "approved") {
      setFeedback({ title: "教員承認待ち", description: "このクエストは承認後に挑戦できます。" });
      return;
    }
    if (state.challengedQuests.includes(quest.id)) {
      setFeedback({ title: "挑戦中", description: "詳細画面から成果物を提出できます。" });
      return;
    }
    setState((prev) =>
      touchActivity({
        ...prev,
        challengedQuests: unique([...prev.challengedQuests, quest.id])
      })
    );
    gainXp(25, quest.skills, "クエスト開始", `${quest.title} に挑戦開始。準備XP 25を獲得しました。`);
  };

  const completeQuest = (quest: Quest) => {
    const approval = state.questApprovals[quest.id] ?? quest.approvalStatus;
    if (approval !== "approved") {
      setFeedback({ title: "提出不可", description: "教員承認済みのクエストだけ提出できます。" });
      return;
    }
    if (state.completedQuests.includes(quest.id)) {
      setFeedback({ title: "提出済み", description: "このクエストの実績はポートフォリオに登録済みです。" });
      return;
    }
    setState((prev) =>
      touchActivity({
        ...prev,
        challengedQuests: unique([...prev.challengedQuests, quest.id]),
        completedQuests: unique([...prev.completedQuests, quest.id])
      })
    );
    gainXp(quest.xp, quest.skills, "クエスト完了", `${quest.title} を完了し、${quest.xp}XPを獲得しました。`);
  };

  const addQuest = (quest: Quest) => {
    setState((prev) =>
      touchActivity({
        ...prev,
        addedQuests: [quest, ...prev.addedQuests],
        questApprovals: { ...prev.questApprovals, [quest.id]: "pending" }
      })
    );
    setFeedback({ title: "企業クエストを受付", description: "教員承認待ちとしてクエストボードに登録しました。" });
  };

  const updateApproval = (questId: string, status: ApprovalStatus, comment: string) => {
    setState((prev) =>
      touchActivity({
        ...prev,
        questApprovals: { ...prev.questApprovals, [questId]: status },
        teacherComments: { ...prev.teacherComments, [questId]: comment }
      })
    );
    const label = status === "approved" ? "承認" : status === "revision" ? "差し戻し" : "却下";
    setFeedback({ title: `教員${label}`, description: "学生側の挑戦可否に反映しました。" });
  };

  const joinTeamQuest = (teamQuest: TeamQuest) => {
    if (state.joinedTeamQuests.includes(teamQuest.id)) {
      setFeedback({ title: "申請済み", description: "チームメンバー欄に参加申請が記録されています。" });
      return;
    }
    setState((prev) =>
      touchActivity({
        ...prev,
        joinedTeamQuests: unique([...prev.joinedTeamQuests, teamQuest.id])
      })
    );
    gainXp(50, teamQuest.skills, "チーム参加申請", `${teamQuest.title} に参加申請し、協力XP 50を獲得しました。`);
  };

  const addEvaluation = (record: EvaluationRecord) => {
    setState((prev) =>
      touchActivity({
        ...prev,
        evaluations: [record, ...prev.evaluations]
      })
    );
    setFeedback({ title: "相互評価を記録", description: "企業評価と学生評価をポートフォリオへ反映しました。" });
  };

  const unlockedBadges = useMemo(() => {
    const ids = getUnlockedBadgeIds(state);
    return badges.map((badge) => ({ ...badge, unlocked: ids.has(badge.id) }));
  }, [state]);

  return {
    state,
    hydrated,
    feedback,
    unlockedBadges,
    actions: {
      completeLesson,
      startQuest,
      completeQuest,
      addQuest,
      updateApproval,
      joinTeamQuest,
      addEvaluation
    }
  };
}

export type GuildStore = ReturnType<typeof useGuildState>;
