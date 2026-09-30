/** Authoring v2 shapes. Render stays in site.yaml and template.yaml. */

export type AuthoringId = string;
export type Fingerprint = string;
export type AuthoringPointer = string;

export type AccentSource = "project" | "template" | "legacy";
export type ActionStyle = "accent" | "neutral";
export type AnswerOrigin = "user" | "inferred" | "recommended" | "imported";
export type SectionSelection = "include" | "omit" | "preserve";
export type SectionReadiness = "ready" | "needs-input" | "unsupported";

export type AuthoringOperation =
  | { op: "set"; path: AuthoringPointer; value: unknown; reasonCode: AuthoringId }
  | { op: "unset-template"; path: AuthoringPointer; reasonCode: AuthoringId }
  | {
      op: "insert-section";
      sectionId: AuthoringId;
      variant: AuthoringId;
      content: Record<string, unknown>;
      index: number;
      reasonCode: AuthoringId;
    }
  | { op: "hide-section"; sectionId: AuthoringId; reasonCode: AuthoringId }
  | { op: "restore-section"; sectionId: AuthoringId; reasonCode: AuthoringId }
  | { op: "reorder-sections"; order: AuthoringId[]; reasonCode: AuthoringId }
  | {
      op: "select-template";
      templateId: AuthoringId;
      retainOverridePaths: AuthoringPointer[];
      reasonCode: AuthoringId;
    };

export type SectionDecision = {
  id: AuthoringId;
  variant: AuthoringId;
  selection: SectionSelection;
  readiness: SectionReadiness;
  evidenceIds: AuthoringId[];
  reasonCodes: AuthoringId[];
};

export type AuthoringPlan = {
  schema: "gvaste-pages/authoring-plan/v2";
  id: AuthoringId;
  briefId: AuthoringId;
  projectId: AuthoringId;
  sourceFingerprint: Fingerprint;
  briefFingerprint: Fingerprint;
  evidenceFingerprint: Fingerprint;
  capabilitiesVersion: string;
  engineVersion: string;
  sections: SectionDecision[];
  operations: AuthoringOperation[];
  warnings: string[];
};

export type AuthoringPreferences = {
  templateId: string | null;
  theme: "dark" | "light" | "unknown";
  frame: "full" | "window" | "unknown";
  accent: string | null;
  accentSource: AccentSource;
  actionStyle: ActionStyle;
  shade: string | null;
};

export type LocalBinding = {
  draftId: string;
  documentRevision: number;
  storageRevision: number;
  writeId: AuthoringId | null;
};

export type StagingTexts = {
  siteText: string;
  templateText: string;
  retained: Record<string, { value: unknown; index: number }>;
  lastValidText: { siteText: string; templateText: string } | null;
};
