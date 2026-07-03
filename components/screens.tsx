"use client";

import {
  AlertTriangle,
  Award,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  ClipboardCheck,
  Cog,
  Cpu,
  Download,
  Factory,
  FileCheck2,
  Gauge,
  GraduationCap,
  Medal,
  Network,
  Play,
  Printer,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { dangerLabelOptions } from "@/data/mock-data";
import { averageCompanyRating, averageStudentCompanyRating, getLevelInfo, getSkillLevel, type GuildStore } from "@/hooks/use-guild-state";
import type {
  Ad,
  ApprovalStatus,
  Difficulty,
  EvaluationRecord,
  Lesson,
  Quest,
  ScreenId,
  SkillDefinition,
  SkillId,
  SubmissionTemplate,
  TeamQuest
} from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CommonProps = {
  guild: GuildStore;
  quests: Quest[];
  lessons: Lesson[];
  ads: Ad[];
  ranking: Array<{ name: string; department: string; xp: number; title: string }>;
  skills: SkillDefinition[];
  submissionTemplates: SubmissionTemplate[];
  teamQuests: TeamQuest[];
  onNavigate: (screen: ScreenId) => void;
  onOpenQuest: (quest: Quest) => void;
};

const skillIconMap: Record<SkillId, typeof Boxes> = {
  cad: Boxes,
  mechanics: Gauge,
  drawing: FileCheck2,
  manufacturing: Cog,
  measurement: Target,
  electronics: CircuitBoard,
  control: Cpu,
  aiDx: BrainCircuit,
  report: ClipboardCheck,
  team: Users
};

const difficultyTone: Record<Difficulty, "cyan" | "green" | "amber" | "rose"> = {
  入門: "green",
  標準: "cyan",
  応用: "amber",
  高難度: "rose"
};

const approvalLabels: Record<ApprovalStatus, { label: string; tone: "cyan" | "amber" | "green" | "rose" | "muted" }> = {
  approved: { label: "教員承認済み", tone: "green" },
  pending: { label: "教員承認待ち", tone: "amber" },
  revision: { label: "差し戻し", tone: "cyan" },
  rejected: { label: "却下", tone: "rose" }
};

function SectionTitle({ icon: Icon, title, description }: { icon: typeof Sparkles; title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <Icon className="h-4 w-4" />
          技術者ギルド
        </div>
        <h2 className="text-2xl font-bold tracking-normal md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function SkillChip({ skill, skills }: { skill: SkillId; skills: SkillDefinition[] }) {
  const definition = skills.find((item) => item.id === skill);
  const Icon = skillIconMap[skill];
  return (
    <Badge variant="cyan" className="whitespace-nowrap">
      <Icon className="h-3.5 w-3.5" />
      {definition?.name ?? skill}
    </Badge>
  );
}

function AdSlot({ ad, compact = false }: { ad: Ad; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md border border-violet-300/25 bg-violet-300/8 p-4", compact && "p-3")}>
      <div className="absolute right-3 top-3 text-[10px] font-bold uppercase text-violet-200/70">AD</div>
      <p className="text-xs font-semibold text-violet-200">{ad.category}</p>
      <h3 className={cn("mt-1 font-bold", compact ? "text-sm" : "text-lg")}>{ad.title}</h3>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{ad.copy}</p>
      <Button variant="outline" size="sm" className="mt-3 border-violet-300/30 text-violet-100">
        {ad.cta}
      </Button>
    </div>
  );
}

function QuestStatusBadge({ status }: { status: ApprovalStatus }) {
  const item = approvalLabels[status];
  return (
    <Badge variant={item.tone}>
      <ShieldCheck className="h-3.5 w-3.5" />
      {item.label}
    </Badge>
  );
}

function QuestCard({
  quest,
  skills,
  onOpenQuest,
  onStart,
  completed,
  challenged
}: {
  quest: Quest;
  skills: SkillDefinition[];
  onOpenQuest: (quest: Quest) => void;
  onStart: (quest: Quest) => void;
  completed: boolean;
  challenged: boolean;
}) {
  const canChallenge = quest.approvalStatus === "approved";
  return (
    <Card className="relative overflow-hidden">
      <div className="quest-scan absolute inset-0 opacity-70" />
      <CardHeader className="relative">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={difficultyTone[quest.difficulty]}>{quest.difficulty}</Badge>
          <QuestStatusBadge status={quest.approvalStatus} />
          {quest.rare && (
            <Badge variant="rose">
              <Sparkles className="h-3.5 w-3.5" />
              レアクエスト
            </Badge>
          )}
          {quest.team && (
            <Badge variant="violet">
              <Users className="h-3.5 w-3.5" />
              チーム可
            </Badge>
          )}
        </div>
        <CardTitle>{quest.title}</CardTitle>
        <CardDescription>{quest.company} / {quest.industry}</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Info label="報酬" value={quest.reward} />
          <Info label="経験値" value={`${quest.xp}XP`} />
          <Info label="締切" value={quest.deadline} />
          <Info label="推奨" value={quest.recommendedGrade} />
        </div>
        <div className="flex flex-wrap gap-2">
          {quest.skills.map((skill) => (
            <SkillChip key={skill} skill={skill} skills={skills} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={quest.remote ? "green" : "amber"}>{quest.remote ? "リモート可" : "現地/学校作業あり"}</Badge>
          <Badge variant="outline">安全Lv {quest.safetyLevel}</Badge>
          {quest.dangerLabels.slice(0, 3).map((label) => (
            <Badge key={label} variant="muted">{label}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="relative flex flex-wrap gap-2">
        <Button onClick={() => onOpenQuest(quest)} variant="outline">
          詳細
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={() => onStart(quest)} disabled={!canChallenge || completed}>
          {completed ? "完了済み" : challenged ? "挑戦中" : "挑戦する"}
          <Play className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border/70 bg-slate-950/45 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

export function HomeScreen({ guild, quests, lessons, ads, ranking, skills, onNavigate, onOpenQuest }: CommonProps) {
  const level = getLevelInfo(guild.state.xp);
  const approvedQuests = quests.filter((quest) => quest.approvalStatus === "approved");
  const recommendedQuest = approvedQuests.find((quest) => !guild.state.completedQuests.includes(quest.id)) ?? approvedQuests[0];
  const recommendedLessons = lessons.filter((lesson) => !guild.state.completedLessons.includes(lesson.id)).slice(0, 3);
  const unlocked = guild.unlockedBadges.filter((badge) => badge.unlocked);

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Rocket}
        title="今日の技術クエストボード"
        description="企業の小さな技術課題を、学び・経験値・ポートフォリオ実績へ変換する高専生向けダッシュボードです。"
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-cyan-200">ようこそ、{guild.state.userName} さん</p>
                <CardTitle className="mt-1 text-3xl">Lv.{level.level} {guild.state.title}</CardTitle>
              </div>
              <Badge variant="amber" className="w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                {guild.state.streak}日連続学習
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">総経験値 {formatNumber(guild.state.xp)}XP</span>
                <span className="font-semibold text-cyan-100">次のLvまで {level.next - level.current}XP</span>
              </div>
              <Progress value={level.progress} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="完了クエスト" value={`${guild.state.completedQuests.length}件`} />
              <Info label="学習済み教材" value={`${guild.state.completedLessons.length}件`} />
              <Info label="挑戦中" value={`${guild.state.challengedQuests.length}件`} />
              <Info label="企業評価平均" value={`${averageCompanyRating(guild.state.evaluations)} / 5`} />
            </div>
            <div className="flex flex-wrap gap-2">
              {unlocked.slice(0, 6).map((badge) => (
                <Badge key={badge.id} variant={badge.tone}>
                  <Medal className="h-3.5 w-3.5" />
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-200" />
              今週のランキング
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ranking.slice(0, 5).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-3 rounded-md border border-border/70 bg-slate-950/45 p-3">
                <div className={cn("grid h-8 w-8 place-items-center rounded-md font-bold", index < 3 ? "bg-amber-300 text-slate-950" : "bg-slate-800")}>{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{entry.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.department} / {entry.title}</p>
                </div>
                <span className="text-sm font-bold text-cyan-100">{formatNumber(entry.xp)}XP</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.75fr]">
        {recommendedQuest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollIcon />
                おすすめクエスト
              </CardTitle>
              <CardDescription>{recommendedQuest.company}からの実務課題</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-xl font-bold">{recommendedQuest.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{recommendedQuest.background}</p>
              <div className="flex flex-wrap gap-2">
                {recommendedQuest.skills.map((skill) => (
                  <SkillChip key={skill} skill={skill} skills={skills} />
                ))}
              </div>
              <Button onClick={() => onOpenQuest(recommendedQuest)}>
                クエストを見る
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-emerald-200" />
              おすすめ学習コンテンツ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedLessons.map((lesson) => (
              <div key={lesson.id} className="rounded-md border border-border/70 bg-slate-950/45 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={difficultyTone[lesson.difficulty]}>{lesson.difficulty}</Badge>
                  <Badge variant="outline">{lesson.minutes}分</Badge>
                  <Badge variant="green">+{lesson.xp}XP</Badge>
                </div>
                <p className="font-bold">{lesson.title}</p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{lesson.summary}</p>
              </div>
            ))}
            <Button variant="outline" onClick={() => onNavigate("learning")}>学習ページへ</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-200" />
                デイリークエスト
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Daily done={guild.state.completedLessons.length >= 3} text="教材を1つ完了する" />
              <Daily done={guild.state.challengedQuests.length >= 2} text="承認済みクエストに挑戦する" />
              <Daily done={guild.state.joinedTeamQuests.length > 0} text="チームクエストを確認する" />
            </CardContent>
          </Card>
          <AdSlot ad={ads[0]} compact />
        </div>
      </div>
    </div>
  );
}

function ScrollIcon() {
  return <ClipboardCheck className="h-5 w-5 text-cyan-200" />;
}

function Daily({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/70 bg-slate-950/45 p-3">
      {done ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Target className="h-5 w-5 text-amber-200" />}
      <span className={done ? "text-emerald-100" : "text-foreground"}>{text}</span>
    </div>
  );
}

export function QuestListScreen({ guild, quests, skills, onOpenQuest }: CommonProps) {
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rare" | "team">("all");
  const filtered = quests.filter((quest) => {
    if (filter === "approved") return quest.approvalStatus === "approved";
    if (filter === "pending") return quest.approvalStatus === "pending" || quest.approvalStatus === "revision";
    if (filter === "rare") return quest.rare;
    if (filter === "team") return quest.team;
    return true;
  });

  return (
    <div className="space-y-5">
      <SectionTitle icon={ClipboardCheck} title="企業クエスト一覧" description="企業の小さな技術課題を、難易度・安全レベル・教員承認状態つきで確認できます。" />
      <div className="flex flex-wrap gap-2">
        {[
          ["all", "すべて"],
          ["approved", "挑戦可能"],
          ["pending", "承認待ち"],
          ["rare", "レア"],
          ["team", "チーム"]
        ].map(([id, label]) => (
          <Button key={id} size="sm" variant={filter === id ? "default" : "outline"} onClick={() => setFilter(id as typeof filter)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            skills={skills}
            onOpenQuest={onOpenQuest}
            onStart={guild.actions.startQuest}
            completed={guild.state.completedQuests.includes(quest.id)}
            challenged={guild.state.challengedQuests.includes(quest.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function QuestDetailScreen({ guild, quest, skills, ads, onNavigate }: CommonProps & { quest: Quest }) {
  const completed = guild.state.completedQuests.includes(quest.id);
  const challenged = guild.state.challengedQuests.includes(quest.id);
  const canSubmit = quest.approvalStatus === "approved";

  return (
    <div className="space-y-5">
      <SectionTitle icon={Factory} title={quest.title} description={`${quest.company}が投稿した技術クエストの詳細です。`} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant={difficultyTone[quest.difficulty]}>{quest.difficulty}</Badge>
                <QuestStatusBadge status={quest.approvalStatus} />
                <Badge variant={quest.remote ? "green" : "amber"}>{quest.remote ? "リモート可" : "現地/学校作業あり"}</Badge>
                <Badge variant="outline">安全Lv {quest.safetyLevel}</Badge>
              </div>
              <CardTitle>依頼概要</CardTitle>
              <CardDescription>{quest.background}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailBlock title="依頼内容" text={quest.request} />
              <DetailBlock title="成果物" text={quest.deliverables} />
              <DetailBlock title="必要な知識" text={quest.knowledge} />
              <DetailBlock title="使用する設備" text={quest.equipment} />
              <DetailBlock title="注意事項" text={quest.cautions} warning />
              <DetailBlock title="評価基準" text={quest.criteria} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Info label="報酬" value={quest.reward} />
                <Info label="経験値" value={`${quest.xp}XP`} />
                <Info label="締切" value={quest.deadline} />
                <Info label="推奨学年" value={quest.recommendedGrade} />
              </div>
              <div>
                <p className="mb-2 text-sm font-bold">必要スキル</p>
                <div className="flex flex-wrap gap-2">
                  {quest.skills.map((skill) => (
                    <SkillChip key={skill} skill={skill} skills={skills} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold">危険度ラベル</p>
                <div className="flex flex-wrap gap-2">
                  {quest.dangerLabels.map((label) => (
                    <Badge key={label} variant="amber">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="企業評価" value={`${quest.companyRating || "-"} / 5`} />
                <Info label="学生から見た企業評価" value={`${quest.studentCompanyRating || "未評価"} / 5`} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button onClick={() => guild.actions.startQuest(quest)} disabled={!canSubmit || challenged || completed}>
                {challenged ? "挑戦中" : "挑戦する"}
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="success" onClick={() => guild.actions.completeQuest(quest)} disabled={!canSubmit || completed}>
                {completed ? "提出済み" : "成果物を提出して完了"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => onNavigate("templates")}>
                提出テンプレートを見る
              </Button>
            </CardFooter>
          </Card>
        </div>
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">参考教材</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quest.references.map((reference) => (
                <div key={reference} className="rounded-md border border-border/70 bg-slate-950/45 p-3 text-sm">
                  {reference}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">提出テンプレート</CardTitle>
              <CardDescription>{quest.submissionFormat}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">成果物、根拠、未確定点、企業への質問をセットにして提出すると、実績証明で見せやすくなります。</p>
            </CardContent>
          </Card>
          <AdSlot ad={ads[1]} />
        </aside>
      </div>
    </div>
  );
}

function DetailBlock({ title, text, warning }: { title: string; text: string; warning?: boolean }) {
  return (
    <div className={cn("rounded-md border p-4", warning ? "border-amber-300/30 bg-amber-300/8" : "border-border/70 bg-slate-950/45")}>
      <p className="mb-1 text-sm font-bold">{title}</p>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

type CompanyForm = {
  title: string;
  company: string;
  industry: string;
  problem: string;
  request: string;
  deliverables: string;
  allowedData: string;
  confidentiality: string;
  skills: string;
  recommendedGrade: string;
  difficulty: Difficulty;
  reward: string;
  deadline: string;
  remote: string;
  schoolEquipment: string;
  teacherCheckRequired: string;
  safetyNotes: string;
  dangerLabels: string;
  team: string;
  learningValue: string;
  submissionFormat: string;
  criteria: string;
};

const defaultCompanyForm: CompanyForm = {
  title: "",
  company: "",
  industry: "",
  problem: "",
  request: "",
  deliverables: "",
  allowedData: "",
  confidentiality: "必要。学校・学生・企業の範囲に限定",
  skills: "CAD, 図面読解, レポート作成",
  recommendedGrade: "3年生以上",
  difficulty: "標準",
  reward: "10,000円",
  deadline: "2026-08-20",
  remote: "true",
  schoolEquipment: "なし",
  teacherCheckRequired: "true",
  safetyNotes: "",
  dangerLabels: "リモートのみ",
  team: "false",
  learningValue: "",
  submissionFormat: "PDF",
  criteria: ""
};

const skillNameToId: Record<string, SkillId> = {
  CAD: "cad",
  cad: "cad",
  材料力学: "mechanics",
  図面読解: "drawing",
  加工知識: "manufacturing",
  実験: "measurement",
  計測: "measurement",
  電子工作: "electronics",
  制御: "control",
  AI: "aiDx",
  DX: "aiDx",
  レポート作成: "report",
  チーム開発: "team"
};

function parseSkills(value: string): SkillId[] {
  const parsed = value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => skillNameToId[item] ?? "report");
  return Array.from(new Set(parsed));
}

function parseList(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CompanyPostScreen({ guild }: CommonProps) {
  const [form, setForm] = useState<CompanyForm>(defaultCompanyForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof CompanyForm, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const quest: Quest = {
      id: `q-company-${Date.now()}`,
      title: form.title || "新規技術クエスト",
      company: form.company || "サンプル企業",
      industry: form.industry || "製造業",
      difficulty: form.difficulty,
      recommendedGrade: form.recommendedGrade,
      skills: parseSkills(form.skills),
      reward: form.reward,
      xp: form.difficulty === "高難度" ? 460 : form.difficulty === "応用" ? 330 : form.difficulty === "標準" ? 240 : 160,
      deadline: form.deadline,
      remote: form.remote === "true",
      safetyLevel: form.dangerLabels.includes("薬品") || form.dangerLabels.includes("高電圧") ? 4 : form.remote === "true" ? 1 : 2,
      dangerLabels: parseList(form.dangerLabels),
      teacherCheckRequired: form.teacherCheckRequired === "true",
      approvalStatus: "pending",
      team: form.team === "true",
      background: form.problem,
      request: form.request,
      deliverables: form.deliverables,
      knowledge: form.skills,
      equipment: form.schoolEquipment,
      cautions: form.safetyNotes || "教員確認後、学生が関与できる範囲を明確にしてください。",
      criteria: form.criteria,
      references: ["関連教材を教員が確認", "提出テンプレート"],
      companyRating: 0,
      studentCompanyRating: 0,
      confidentiality: form.confidentiality,
      allowedData: form.allowedData,
      learningValue: form.learningValue,
      submissionFormat: form.submissionFormat
    };
    guild.actions.addQuest(quest);
    setSubmitted(true);
    setForm(defaultCompanyForm);
  };

  return (
    <div className="space-y-5">
      <SectionTitle icon={BriefcaseBusiness} title="企業向け仕事投稿テンプレート" description="迷わず書けるフォームで、企業課題を学生の成長クエストに変換します。送信後は教員承認待ちになります。" />
      {submitted && (
        <Card className="border-emerald-300/35 bg-emerald-300/8">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              <p className="font-bold">投稿を受け付けました。教員承認画面で確認できます。</p>
            </div>
          </CardContent>
        </Card>
      )}
      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>依頼内容</CardTitle>
            <CardDescription>安全性、秘密保持、学生にとっての学びを必ず明記してください。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="依頼タイトル"><Input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="例: 治具の改善案を考える" /></Field>
            <Field label="会社名"><Input required value={form.company} onChange={(e) => update("company", e.target.value)} /></Field>
            <Field label="業種"><Input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="例: 金属加工" /></Field>
            <Field label="推奨学年"><Input value={form.recommendedGrade} onChange={(e) => update("recommendedGrade", e.target.value)} /></Field>
            <Field label="困っていること" wide><Textarea required value={form.problem} onChange={(e) => update("problem", e.target.value)} /></Field>
            <Field label="依頼したい作業" wide><Textarea required value={form.request} onChange={(e) => update("request", e.target.value)} /></Field>
            <Field label="成果物" wide><Textarea required value={form.deliverables} onChange={(e) => update("deliverables", e.target.value)} /></Field>
            <Field label="使ってよいデータ"><Input value={form.allowedData} onChange={(e) => update("allowedData", e.target.value)} placeholder="図面PDF、写真、動画など" /></Field>
            <Field label="秘密保持の必要性"><Input value={form.confidentiality} onChange={(e) => update("confidentiality", e.target.value)} /></Field>
            <Field label="必要スキル"><Input value={form.skills} onChange={(e) => update("skills", e.target.value)} /></Field>
            <Field label="難易度">
              <Select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value as Difficulty)}>
                <option>入門</option>
                <option>標準</option>
                <option>応用</option>
                <option>高難度</option>
              </Select>
            </Field>
            <Field label="報酬"><Input value={form.reward} onChange={(e) => update("reward", e.target.value)} /></Field>
            <Field label="締切"><Input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} /></Field>
            <Field label="リモート可否">
              <Select value={form.remote} onChange={(e) => update("remote", e.target.value)}>
                <option value="true">リモート可</option>
                <option value="false">学校/現場作業あり</option>
              </Select>
            </Field>
            <Field label="学校設備の利用有無"><Input value={form.schoolEquipment} onChange={(e) => update("schoolEquipment", e.target.value)} /></Field>
            <Field label="教員確認の必要性">
              <Select value={form.teacherCheckRequired} onChange={(e) => update("teacherCheckRequired", e.target.value)}>
                <option value="true">必要</option>
                <option value="false">不要</option>
              </Select>
            </Field>
            <Field label="危険度ラベル"><Input value={form.dangerLabels} onChange={(e) => update("dangerLabels", e.target.value)} /></Field>
            <Field label="チームクエスト可否">
              <Select value={form.team} onChange={(e) => update("team", e.target.value)}>
                <option value="false">個人向け</option>
                <option value="true">チーム可</option>
              </Select>
            </Field>
            <Field label="提出物の形式"><Input value={form.submissionFormat} onChange={(e) => update("submissionFormat", e.target.value)} /></Field>
            <Field label="安全面の注意" wide><Textarea value={form.safetyNotes} onChange={(e) => update("safetyNotes", e.target.value)} /></Field>
            <Field label="学生にとって学べること" wide><Textarea required value={form.learningValue} onChange={(e) => update("learningValue", e.target.value)} /></Field>
            <Field label="評価基準" wide><Textarea required value={form.criteria} onChange={(e) => update("criteria", e.target.value)} /></Field>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg">
              教員承認待ちとして投稿
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">危険度ラベル例</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {dangerLabelOptions.map((label) => (
                <Badge key={label} variant="amber">{label}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">投稿後の流れ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. 教員が安全性・難易度・守秘義務を確認</p>
              <p>2. 承認後、学生側で挑戦ボタンが有効化</p>
              <p>3. 成果物提出後、経験値と実績証明に反映</p>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={cn("space-y-2", wide && "md:col-span-2")}>
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  );
}

export function LearningScreen({ guild, lessons, quests, skills, ads, onOpenQuest }: CommonProps) {
  const categories = Array.from(new Set(lessons.map((lesson) => lesson.category)));
  const [category, setCategory] = useState<string>("すべて");
  const filtered = category === "すべて" ? lessons : lessons.filter((lesson) => lesson.category === category);

  return (
    <div className="space-y-5">
      <SectionTitle icon={BookOpenCheck} title="機械設計学習ラボ" description="学ぶとスキル経験値が伸び、関連クエストで成果物として使える知識になります。" />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["すべて", ...categories].map((item) => (
              <Button key={item} size="sm" variant={category === item ? "default" : "outline"} onClick={() => setCategory(item)}>
                {item}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((lesson) => {
              const done = guild.state.completedLessons.includes(lesson.id);
              return (
                <Card key={lesson.id}>
                  <CardHeader>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{lesson.category}</Badge>
                      <Badge variant={difficultyTone[lesson.difficulty]}>{lesson.difficulty}</Badge>
                      <Badge variant="green">+{lesson.xp}XP</Badge>
                      <Badge variant="muted">{lesson.minutes}分</Badge>
                    </div>
                    <CardTitle>{lesson.title}</CardTitle>
                    <CardDescription>{lesson.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border border-cyan-300/20 bg-cyan-300/8 p-3 text-sm">
                      <p className="mb-1 font-bold text-cyan-100">ミニクイズ</p>
                      <p className="leading-6 text-muted-foreground">{lesson.quiz}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lesson.skills.map((skill) => (
                        <SkillChip key={skill} skill={skill} skills={skills} />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold">関連クエスト</p>
                      {lesson.relatedQuestIds.map((id) => {
                        const quest = quests.find((item) => item.id === id);
                        return quest ? (
                          <button key={id} className="block w-full rounded-md border border-border/70 bg-slate-950/45 p-3 text-left text-sm transition hover:border-primary/50" onClick={() => onOpenQuest(quest)}>
                            {quest.title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant={done ? "outline" : "success"} onClick={() => guild.actions.completeLesson(lesson)} disabled={done}>
                      {done ? "学習完了済み" : "学習完了"}
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
        <aside className="space-y-4">
          <AdSlot ad={ads[2]} />
          <AdSlot ad={ads[3]} />
        </aside>
      </div>
    </div>
  );
}

export function SkillTreeScreen({ guild, skills }: CommonProps) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={Network} title="スキルツリー" description="教材やクエストの完了で、対応するスキル経験値が伸びます。" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill, index) => {
          const Icon = skillIconMap[skill.id];
          const xp = guild.state.skillXp[skill.id] ?? skill.baseXp;
          const level = getSkillLevel(xp);
          return (
            <Card key={skill.id} className={cn(index % 3 === 1 && "border-violet-300/30", index % 3 === 2 && "border-amber-300/30")}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-cyan-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{skill.name}</CardTitle>
                      <CardDescription>Lv.{level.level} / {formatNumber(xp)}XP</CardDescription>
                    </div>
                  </div>
                  <Badge variant="cyan">成長中</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={level.progress} />
                <p className="text-sm leading-6 text-muted-foreground">{skill.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileScreen({ guild, quests, lessons, skills, onNavigate }: CommonProps) {
  const level = getLevelInfo(guild.state.xp);
  const completedQuests = quests.filter((quest) => guild.state.completedQuests.includes(quest.id));
  const completedLessons = lessons.filter((lesson) => guild.state.completedLessons.includes(lesson.id));
  const topSkills = [...skills]
    .sort((a, b) => (guild.state.skillXp[b.id] ?? 0) - (guild.state.skillXp[a.id] ?? 0))
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <SectionTitle icon={Trophy} title="実績ポートフォリオ" description="学習・企業クエスト・相互評価を、就活やインターンで見せられる形にまとめます。" />
      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <div className="grid h-20 w-20 place-items-center rounded-md bg-primary text-slate-950 shadow-neon">
              <GraduationCap className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl">{guild.state.userName}</CardTitle>
            <CardDescription>Lv.{level.level} {guild.state.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={level.progress} />
            <Info label="総経験値" value={`${formatNumber(guild.state.xp)}XP`} />
            <Info label="企業評価平均" value={`${averageCompanyRating(guild.state.evaluations)} / 5`} />
            <Info label="学生が企業につけた評価" value={`${averageStudentCompanyRating(guild.state.evaluations)} / 5`} />
            <Button className="w-full" onClick={() => onNavigate("certificate")}>
              スキル証明書PDF出力
              <Printer className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>得意スキル</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {topSkills.map((skill) => {
                const levelInfo = getSkillLevel(guild.state.skillXp[skill.id]);
                return (
                  <div key={skill.id} className="rounded-md border border-border/70 bg-slate-950/45 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <SkillChip skill={skill.id} skills={skills} />
                      <span className="font-bold">Lv.{levelInfo.level}</span>
                    </div>
                    <Progress value={levelInfo.progress} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ポートフォリオとして見せられる実績一覧</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="rounded-md border border-emerald-300/25 bg-emerald-300/8 p-4">
                  <Badge variant="green">教員承認済み実績</Badge>
                  <h3 className="mt-3 font-bold">{quest.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{quest.deliverables}</p>
                </div>
              ))}
              {completedQuests.length === 0 && <p className="text-sm text-muted-foreground">完了クエストはまだありません。</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>学習済み教材と獲得バッジ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {completedLessons.map((lesson) => (
                  <Badge key={lesson.id} variant="cyan">{lesson.title}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {guild.unlockedBadges.filter((badge) => badge.unlocked).map((badge) => (
                  <Badge key={badge.id} variant={badge.tone}>
                    <Award className="h-3.5 w-3.5" />
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function TeacherApprovalScreen({ guild, quests }: CommonProps) {
  const [comments, setComments] = useState<Record<string, string>>({});
  const waiting = quests.filter((quest) => quest.approvalStatus === "pending" || quest.approvalStatus === "revision");

  return (
    <div className="space-y-5">
      <SectionTitle icon={ShieldCheck} title="教員承認コンソール" description="安全性、難易度、守秘義務、学生にとっての学びを確認し、挑戦可否を制御します。" />
      <div className="grid gap-4">
        {waiting.map((quest) => (
          <Card key={quest.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <QuestStatusBadge status={quest.approvalStatus} />
                <Badge variant={difficultyTone[quest.difficulty]}>{quest.difficulty}</Badge>
                <Badge variant="outline">安全Lv {quest.safetyLevel}</Badge>
              </div>
              <CardTitle>{quest.title}</CardTitle>
              <CardDescription>{quest.company} / {quest.industry}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                <DetailBlock title="依頼内容" text={quest.request} />
                <DetailBlock title="学生にとって学べること" text={quest.learningValue} />
                <DetailBlock title="秘密保持の必要性" text={quest.confidentiality} />
                <DetailBlock title="使用設備" text={quest.equipment} />
              </div>
              <div className="space-y-3">
                <Info label="報酬" value={quest.reward} />
                <Info label="推奨学年" value={quest.recommendedGrade} />
                <div className="rounded-md border border-amber-300/30 bg-amber-300/8 p-3">
                  <p className="mb-2 text-sm font-bold">危険度ラベル</p>
                  <div className="flex flex-wrap gap-2">
                    {quest.dangerLabels.map((label) => (
                      <Badge key={label} variant="amber">{label}</Badge>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="教員コメント"
                  value={comments[quest.id] ?? guild.state.teacherComments[quest.id] ?? ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [quest.id]: e.target.value }))}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="success" onClick={() => guild.actions.updateApproval(quest.id, "approved", comments[quest.id] ?? "")}>承認</Button>
                  <Button variant="outline" onClick={() => guild.actions.updateApproval(quest.id, "revision", comments[quest.id] ?? "")}>差し戻し</Button>
                  <Button variant="destructive" onClick={() => guild.actions.updateApproval(quest.id, "rejected", comments[quest.id] ?? "")}>却下</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {waiting.length === 0 && (
          <Card>
            <CardContent className="pt-5">
              <p className="text-muted-foreground">承認待ちのクエストはありません。</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function SubmissionTemplatesScreen({ submissionTemplates }: CommonProps) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={FileCheck2} title="成果物提出テンプレート" description="学生が迷わず提出できるように、目的・記入項目・評価ポイントをセットで用意しています。" />
      <div className="grid gap-4 md:grid-cols-2">
        {submissionTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TemplateList title="記入項目" items={template.fields} />
              <TemplateList title="提出ファイル形式" items={template.formats} />
              <TemplateList title="評価ポイント" items={template.evaluationPoints} />
              <div className="rounded-md border border-cyan-300/20 bg-cyan-300/8 p-3">
                <p className="mb-1 text-sm font-bold text-cyan-100">サンプル記入例</p>
                <p className="text-sm leading-6 text-muted-foreground">{template.sample}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TemplateList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="outline">{item}</Badge>
        ))}
      </div>
    </div>
  );
}

const companyCriteria: Array<[keyof EvaluationRecord["companyToStudent"], string]> = [
  ["technicalUnderstanding", "技術理解"],
  ["deadline", "納期遵守"],
  ["reporting", "報告のわかりやすさ"],
  ["quality", "成果物品質"],
  ["rehire", "再依頼したい度"]
];

const studentCriteria: Array<[keyof EvaluationRecord["studentToCompany"], string]> = [
  ["clarity", "依頼内容の明確さ"],
  ["responseSpeed", "質問への回答の早さ"],
  ["reward", "報酬の妥当性"],
  ["learning", "学びの多さ"],
  ["safety", "安全配慮"],
  ["recommend", "おすすめ度"]
];

export function RatingsScreen({ guild, quests }: CommonProps) {
  const [questId, setQuestId] = useState(quests[0]?.id ?? "");
  const [comment, setComment] = useState("");
  const [companyScores, setCompanyScores] = useState<EvaluationRecord["companyToStudent"]>({
    technicalUnderstanding: 4,
    deadline: 4,
    reporting: 4,
    quality: 4,
    rehire: 4
  });
  const [studentScores, setStudentScores] = useState<EvaluationRecord["studentToCompany"]>({
    clarity: 4,
    responseSpeed: 4,
    reward: 4,
    learning: 4,
    safety: 4,
    recommend: 4
  });

  const selected = quests.find((quest) => quest.id === questId) ?? quests[0];
  const submit = () => {
    if (!selected) return;
    guild.actions.addEvaluation({
      id: `e-${Date.now()}`,
      questTitle: selected.title,
      company: selected.company,
      companyToStudent: companyScores,
      studentToCompany: studentScores,
      comment: comment || "相互評価を記録しました。"
    });
    setComment("");
  };

  return (
    <div className="space-y-5">
      <SectionTitle icon={Star} title="企業評価・学生評価" description="ブラック案件を防ぎ、企業と学生の双方が安心して挑戦できる評価ログを残します。" />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>相互評価を記録</CardTitle>
            <CardDescription>評価はプロフィールとスキル証明書の信頼材料になります。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="対象クエスト">
              <Select value={questId} onChange={(e) => setQuestId(e.target.value)}>
                {quests.map((quest) => (
                  <option key={quest.id} value={quest.id}>{quest.title}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-5 lg:grid-cols-2">
              <ScorePanel title="企業から学生への評価" criteria={companyCriteria} scores={companyScores} onChange={(key, value) => setCompanyScores((prev) => ({ ...prev, [key]: value }))} />
              <ScorePanel title="学生から企業への評価" criteria={studentCriteria} scores={studentScores} onChange={(key, value) => setStudentScores((prev) => ({ ...prev, [key]: value }))} />
            </div>
            <Field label="コメント" wide><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="依頼の明確さ、安全配慮、成果物の品質など" /></Field>
          </CardContent>
          <CardFooter>
            <Button onClick={submit}>評価を記録</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>評価データ</CardTitle>
            <CardDescription>登録済み {guild.state.evaluations.length}件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {guild.state.evaluations.slice(0, 6).map((record) => (
              <div key={record.id} className="rounded-md border border-border/70 bg-slate-950/45 p-3">
                <p className="font-bold">{record.questTitle}</p>
                <p className="text-sm text-muted-foreground">{record.company}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="amber">企業→学生 {avg(record.companyToStudent)} / 5</Badge>
                  <Badge variant="cyan">学生→企業 {avg(record.studentToCompany)} / 5</Badge>
                </div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{record.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScorePanel<T extends Record<string, number>>({
  title,
  criteria,
  scores,
  onChange
}: {
  title: string;
  criteria: Array<[keyof T, string]>;
  scores: T;
  onChange: (key: keyof T, value: number) => void;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-slate-950/45 p-4">
      <p className="mb-3 font-bold">{title}</p>
      <div className="space-y-3">
        {criteria.map(([key, label]) => (
          <label key={String(key)} className="block">
            <div className="mb-1 flex justify-between text-sm">
              <span>{label}</span>
              <span className="font-bold text-cyan-100">{scores[key]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={scores[key]}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className="w-full accent-cyan-300"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function avg(record: Record<string, number>) {
  const values = Object.values(record);
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function CertificateScreen({ guild, quests, lessons, skills }: CommonProps) {
  const level = getLevelInfo(guild.state.xp);
  const completedQuests = quests.filter((quest) => guild.state.completedQuests.includes(quest.id));
  const completedLessons = lessons.filter((lesson) => guild.state.completedLessons.includes(lesson.id));
  const topSkills = [...skills]
    .sort((a, b) => (guild.state.skillXp[b.id] ?? 0) - (guild.state.skillXp[a.id] ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="no-print">
        <SectionTitle icon={Award} title="スキル証明書PDF出力" description="印刷用レイアウトを開き、ブラウザの保存機能でPDF化できます。" />
        <Button size="lg" onClick={() => window.print()}>
          PDF出力 / 印刷
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <Card className="print-card mx-auto max-w-5xl">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-cyan-200">Kosen Tech Quest Skill Certificate</p>
              <CardTitle className="mt-2 text-3xl">技術クエスト実績証明書</CardTitle>
            </div>
            <Badge variant="green" className="w-fit">教員承認済み実績を含む</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Info label="学生名" value={guild.state.userName} />
            <Info label="レベル" value={`Lv.${level.level}`} />
            <Info label="総経験値" value={`${formatNumber(guild.state.xp)}XP`} />
            <Info label="企業評価平均" value={`${averageCompanyRating(guild.state.evaluations)} / 5`} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-bold">得意スキル</h3>
              <div className="space-y-3">
                {topSkills.map((skill) => {
                  const levelInfo = getSkillLevel(guild.state.skillXp[skill.id]);
                  return (
                    <div key={skill.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{skill.name}</span>
                        <span>Lv.{levelInfo.level}</span>
                      </div>
                      <Progress value={levelInfo.progress} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-bold">概要</h3>
              <div className="grid grid-cols-2 gap-3">
                <Info label="完了クエスト数" value={`${completedQuests.length}件`} />
                <Info label="学習済み教材数" value={`${completedLessons.length}件`} />
                <Info label="獲得バッジ" value={`${guild.unlockedBadges.filter((badge) => badge.unlocked).length}件`} />
                <Info label="学生評価平均" value={`${averageStudentCompanyRating(guild.state.evaluations)} / 5`} />
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold">代表的な成果物</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="rounded-md border border-border/70 bg-slate-950/45 p-4 print-card">
                  <Badge variant="green">教員承認済み</Badge>
                  <p className="mt-2 font-bold">{quest.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{quest.deliverables}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold">獲得バッジ</h3>
            <div className="flex flex-wrap gap-2">
              {guild.unlockedBadges.filter((badge) => badge.unlocked).map((badge) => (
                <Badge key={badge.id} variant={badge.tone}>{badge.name}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TeamQuestScreen({ guild, teamQuests, skills }: CommonProps) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={Users} title="チームクエスト" description="機械・電気・情報など複数学科の学生が、役割分担して大きな技術課題に挑戦します。" />
      <div className="grid gap-4 xl:grid-cols-2">
        {teamQuests.map((quest) => {
          const joined = guild.state.joinedTeamQuests.includes(quest.id);
          const members = joined ? [...quest.members, guild.state.userName] : quest.members;
          return (
            <Card key={quest.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="violet">チーム報酬 {quest.reward}</Badge>
                  <Badge variant="green">+{quest.xp}XP</Badge>
                  <Badge variant="outline">締切 {quest.deadline}</Badge>
                </div>
                <CardTitle>{quest.title}</CardTitle>
                <CardDescription>{quest.company} / {quest.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-bold">募集役割</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {quest.roles.map((role) => (
                      <div key={role.name} className="rounded-md border border-border/70 bg-slate-950/45 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{role.name}</span>
                          <Badge variant={role.joined >= role.needed ? "green" : "amber"}>{role.joined}/{role.needed}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">必要スキル</p>
                  <div className="flex flex-wrap gap-2">
                    {quest.skills.map((skill) => (
                      <SkillChip key={skill} skill={skill} skills={skills} />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Info label="現在の参加メンバー" value={members.join("、")} />
                  <Info label="募集人数" value={`${members.length}/${quest.capacity}人`} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => guild.actions.joinTeamQuest(quest)} disabled={joined}>
                  {joined ? "参加申請済み" : "参加申請する"}
                  <Users className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
