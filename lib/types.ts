export type Difficulty = "入門" | "標準" | "応用" | "高難度";
export type ApprovalStatus = "approved" | "pending" | "revision" | "rejected";

export type SkillId =
  | "cad"
  | "mechanics"
  | "drawing"
  | "manufacturing"
  | "measurement"
  | "electronics"
  | "control"
  | "aiDx"
  | "report"
  | "team";

export type ScreenId =
  | "home"
  | "quests"
  | "questDetail"
  | "companyPost"
  | "learning"
  | "skills"
  | "profile"
  | "teacher"
  | "templates"
  | "ratings"
  | "certificate"
  | "teams";

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  baseXp: number;
}

export interface Quest {
  id: string;
  title: string;
  company: string;
  industry: string;
  difficulty: Difficulty;
  recommendedGrade: string;
  skills: SkillId[];
  reward: string;
  xp: number;
  deadline: string;
  remote: boolean;
  safetyLevel: number;
  dangerLabels: string[];
  teacherCheckRequired: boolean;
  approvalStatus: ApprovalStatus;
  team: boolean;
  rare?: boolean;
  background: string;
  request: string;
  deliverables: string;
  knowledge: string;
  equipment: string;
  cautions: string;
  criteria: string;
  references: string[];
  companyRating: number;
  studentCompanyRating: number;
  confidentiality: string;
  allowedData: string;
  learningValue: string;
  submissionFormat: string;
}

export interface Lesson {
  id: string;
  category: string;
  title: string;
  difficulty: Difficulty;
  minutes: number;
  xp: number;
  summary: string;
  quiz: string;
  relatedQuestIds: string[];
  skills: SkillId[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tone: "cyan" | "amber" | "violet" | "green" | "rose";
}

export interface Ad {
  id: string;
  title: string;
  category: string;
  copy: string;
  cta: string;
}

export interface RankingEntry {
  name: string;
  department: string;
  xp: number;
  title: string;
}

export interface TeamRole {
  name: string;
  needed: number;
  joined: number;
}

export interface TeamQuest {
  id: string;
  title: string;
  company: string;
  roles: TeamRole[];
  skills: SkillId[];
  members: string[];
  capacity: number;
  reward: string;
  xp: number;
  deadline: string;
  description: string;
}

export interface SubmissionTemplate {
  id: string;
  name: string;
  purpose: string;
  fields: string[];
  formats: string[];
  evaluationPoints: string[];
  sample: string;
}

export interface EvaluationRecord {
  id: string;
  questTitle: string;
  company: string;
  companyToStudent: {
    technicalUnderstanding: number;
    deadline: number;
    reporting: number;
    quality: number;
    rehire: number;
  };
  studentToCompany: {
    clarity: number;
    responseSpeed: number;
    reward: number;
    learning: number;
    safety: number;
    recommend: number;
  };
  comment: string;
}

export interface GuildState {
  userName: string;
  xp: number;
  streak: number;
  title: string;
  badges: string[];
  completedLessons: string[];
  completedQuests: string[];
  challengedQuests: string[];
  joinedTeamQuests: string[];
  addedQuests: Quest[];
  questApprovals: Record<string, ApprovalStatus>;
  teacherComments: Record<string, string>;
  skillXp: Record<SkillId, number>;
  evaluations: EvaluationRecord[];
  lastActiveDate: string;
}
