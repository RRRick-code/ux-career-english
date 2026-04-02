export type LanguageItem = {
  id: string;
  kind: string;
  english: string;
  chinese: string;
  scene: string;
  module: string;
  intent: string;
  examplePatternId?: string;
};

export type TaxonomyEntry = {
  key: string;
  label: string;
  description: string;
  order: number;
};

export type TaxonomyMap = {
  kind: TaxonomyEntry[];
  scene: TaxonomyEntry[];
  module: TaxonomyEntry[];
  intent: TaxonomyEntry[];
};

export type StudyMode = "random" | "reinforcement";
export type StudyScope = "term_phrase" | "pattern";
export type LearningStatus = "not_started" | "in_progress" | "mastered";
export type DisplayMode = "bilingual" | "english" | "chinese";
export type FeedbackRating = "hard" | "uncertain" | "easy";

export type LearningRecord = {
  progress: number;
  status: LearningStatus;
};

export type LearningRecordMap = Record<string, LearningRecord>;

export type ItemFilters = {
  scene: string;
  module: string;
  intent: string;
  kind: string;
  status: string;
};
