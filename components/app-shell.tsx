"use client";

import {
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Home,
  Network,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import { ads, lessons, quests, ranking, skills, submissionTemplates, teamQuests } from "@/data/mock-data";
import { useGuildState } from "@/hooks/use-guild-state";
import type { Quest, ScreenId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CertificateScreen,
  CompanyPostScreen,
  HomeScreen,
  LearningScreen,
  ProfileScreen,
  QuestDetailScreen,
  QuestListScreen,
  RatingsScreen,
  SkillTreeScreen,
  SubmissionTemplatesScreen,
  TeacherApprovalScreen,
  TeamQuestScreen
} from "@/components/screens";

const navigation: Array<{ id: ScreenId; label: string; icon: typeof Home }> = [
  { id: "home", label: "ホーム", icon: Home },
  { id: "quests", label: "クエスト", icon: ScrollText },
  { id: "learning", label: "学習", icon: BookOpenCheck },
  { id: "skills", label: "スキル", icon: Network },
  { id: "teams", label: "チーム", icon: Users },
  { id: "profile", label: "プロフィール", icon: Trophy },
  { id: "companyPost", label: "企業投稿", icon: BriefcaseBusiness },
  { id: "teacher", label: "教員承認", icon: ShieldCheck },
  { id: "templates", label: "提出テンプレ", icon: FileCheck2 },
  { id: "ratings", label: "相互評価", icon: Star },
  { id: "certificate", label: "証明書", icon: Award }
];

export function AppShell() {
  const guild = useGuildState();
  const [screen, setScreen] = useState<ScreenId>("home");
  const [selectedQuestId, setSelectedQuestId] = useState("q-cad-old-drawing");

  const allQuests = useMemo<Quest[]>(() => {
    return [...guild.state.addedQuests, ...quests].map((quest) => ({
      ...quest,
      approvalStatus: guild.state.questApprovals[quest.id] ?? quest.approvalStatus
    }));
  }, [guild.state.addedQuests, guild.state.questApprovals]);

  const selectedQuest = allQuests.find((quest) => quest.id === selectedQuestId) ?? allQuests[0];

  const openQuest = (quest: Quest) => {
    setSelectedQuestId(quest.id);
    setScreen("questDetail");
  };

  const commonProps = {
    guild,
    quests: allQuests,
    lessons,
    ads,
    ranking,
    skills,
    submissionTemplates,
    teamQuests,
    onNavigate: setScreen,
    onOpenQuest: openQuest
  };

  return (
    <div className="min-h-screen text-foreground">
      <aside className="no-print fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-border/70 bg-slate-950/82 px-4 py-5 backdrop-blur-xl lg:block">
        <div className="mb-6 flex items-center gap-3 rounded-md border border-cyan-300/20 bg-cyan-300/8 p-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-slate-950 shadow-neon">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-cyan-200">Kosen Tech Quest</p>
            <h1 className="text-lg font-bold">技術者ギルド</h1>
          </div>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition",
                  active
                    ? "border border-primary/40 bg-primary/15 text-cyan-100 shadow-neon"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
                onClick={() => setScreen(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-6 rounded-md border border-amber-300/25 bg-amber-300/8 p-3 text-sm text-amber-50">
          <div className="mb-2 flex items-center gap-2 font-bold">
            <ClipboardCheck className="h-4 w-4" />
            安全ゲート
          </div>
          <p className="text-xs leading-5 text-amber-100/80">教員承認済みのクエストだけが挑戦可能になります。</p>
        </div>
      </aside>

      <header className="no-print sticky top-0 z-20 border-b border-border/70 bg-slate-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-200" />
            <span className="font-bold">Kosen Tech Quest</span>
          </div>
          <Badge variant="cyan">
            <GraduationCap className="h-3.5 w-3.5" />
            高専ギルド
          </Badge>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                size="sm"
                variant={screen === item.id ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setScreen(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </header>

      <main className="px-4 py-5 lg:ml-72 lg:px-7 lg:py-7">
        {screen === "home" && <HomeScreen {...commonProps} />}
        {screen === "quests" && <QuestListScreen {...commonProps} />}
        {screen === "questDetail" && <QuestDetailScreen {...commonProps} quest={selectedQuest} />}
        {screen === "companyPost" && <CompanyPostScreen {...commonProps} />}
        {screen === "learning" && <LearningScreen {...commonProps} />}
        {screen === "skills" && <SkillTreeScreen {...commonProps} />}
        {screen === "profile" && <ProfileScreen {...commonProps} />}
        {screen === "teacher" && <TeacherApprovalScreen {...commonProps} />}
        {screen === "templates" && <SubmissionTemplatesScreen {...commonProps} />}
        {screen === "ratings" && <RatingsScreen {...commonProps} />}
        {screen === "certificate" && <CertificateScreen {...commonProps} />}
        {screen === "teams" && <TeamQuestScreen {...commonProps} />}
      </main>

      {guild.feedback && (
        <div className="no-print fixed bottom-5 right-5 z-50 max-w-sm animate-gain-pop rounded-md border border-cyan-300/40 bg-slate-950/95 p-4 shadow-neon">
          <div className="flex items-start gap-3">
            <div className={cn("grid h-10 w-10 place-items-center rounded-md", guild.feedback.levelUp ? "bg-amber-300 text-slate-950" : "bg-primary text-slate-950")}>
              {guild.feedback.levelUp ? <Trophy className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-bold">{guild.feedback.title}</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{guild.feedback.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
