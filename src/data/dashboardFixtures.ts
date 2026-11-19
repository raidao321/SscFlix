export type ExamName =
  | "SSC CGL"
  | "SSC CHSL"
  | "SSC CPO"
  | "SSC MTS"
  | "SSC GD"
  | "SSC Stenographer";

export type SubjectName = "Reasoning" | "Quantitative Aptitude" | "English";

export type ActivityRecord = {
  id: string;
  exam: ExamName;
  title: string;
  mode: "Exam" | "Practice";
  status: "in-progress" | "completed";
  updatedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  checkedPracticeAnswers?: number;
  correctCheckedPracticeAnswers?: number;
  deadline?: number;
  scored?: boolean;
  maxMarks?: number;
  score?: number;
  subjectResponses?: Partial<Record<SubjectName, { evaluated: number; correct: number }>>;
};

export const TREND_ATTEMPT_THRESHOLD = 3;

export const dashboardFixtures: ActivityRecord[] = [
  {
    id: "cgl-mock-2026-01",
    exam: "SSC CGL",
    title: "SSC CGL Tier I - Full Mock 1",
    mode: "Exam",
    status: "in-progress",
    updatedAt: "2026-11-19T06:30:00.000Z",
    totalQuestions: 25,
    answeredQuestions: 8,
    deadline: 4102444800000,
  },
  {
    id: "cgl-mock-complete-1",
    exam: "SSC CGL",
    title: "SSC CGL Tier I - Full Mock 1",
    mode: "Exam",
    status: "completed",
    updatedAt: "2026-11-18T16:00:00.000Z",
    totalQuestions: 10,
    answeredQuestions: 10,
    scored: true,
    maxMarks: 100,
    score: 72,
    subjectResponses: {
      Reasoning: { evaluated: 4, correct: 3 },
      "Quantitative Aptitude": { evaluated: 3, correct: 3 },
      English: { evaluated: 3, correct: 2 },
    },
  },
  {
    id: "cgl-mock-complete-2",
    exam: "SSC CGL",
    title: "SSC CGL Tier I - Full Mock 2",
    mode: "Exam",
    status: "completed",
    updatedAt: "2026-11-16T15:30:00.000Z",
    totalQuestions: 10,
    answeredQuestions: 10,
    scored: true,
    maxMarks: 100,
    score: 80,
    subjectResponses: {
      Reasoning: { evaluated: 4, correct: 3 },
      "Quantitative Aptitude": { evaluated: 3, correct: 3 },
      English: { evaluated: 3, correct: 3 },
    },
  },
  {
    id: "cgl-mock-complete-3",
    exam: "SSC CGL",
    title: "SSC CGL Tier I - Full Mock 3",
    mode: "Exam",
    status: "completed",
    updatedAt: "2026-11-14T10:15:00.000Z",
    totalQuestions: 10,
    answeredQuestions: 10,
    scored: true,
    maxMarks: 100,
    score: 68,
    subjectResponses: {
      Reasoning: { evaluated: 4, correct: 2 },
      "Quantitative Aptitude": { evaluated: 3, correct: 2 },
      English: { evaluated: 3, correct: 1 },
    },
  },
  {
    id: "chsl-practice-2026-01",
    exam: "SSC CHSL",
    title: "Percentage - Guided Practice",
    mode: "Practice",
    status: "in-progress",
    updatedAt: "2026-11-17T13:20:00.000Z",
    totalQuestions: 10,
    answeredQuestions: 0,
    checkedPracticeAnswers: 3,
    correctCheckedPracticeAnswers: 2,
  },
];

export function getRecordsForExam(exam: ExamName) {
  return dashboardFixtures.filter((record) => record.exam === exam);
}

export function getResumeRecord(records: ActivityRecord[]) {
  return [...records]
    .filter((record) => record.status === "in-progress")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

export function calculateStudySummary(records: ActivityRecord[]) {
  const completedScored = records.filter(
    (record) => record.status === "completed" && record.scored && typeof record.score === "number"
  );

  let questionsAttempted = 0;
  let evaluated = 0;
  let correct = 0;

  for (const record of records) {
    if (record.status === "completed") {
      questionsAttempted += record.answeredQuestions;
    } else if (record.status === "in-progress") {
      questionsAttempted += record.mode === "Practice"
        ? record.checkedPracticeAnswers ?? 0
        : record.answeredQuestions;
    }

    if (record.subjectResponses) {
      for (const subject of Object.values(record.subjectResponses)) {
        if (!subject) continue;
        evaluated += subject.evaluated;
        correct += subject.correct;
      }
    } else if (record.mode === "Practice" && record.status === "completed") {
      evaluated += record.checkedPracticeAnswers ?? 0;
      correct += record.correctCheckedPracticeAnswers ?? 0;
    } else if (record.mode === "Practice" && record.status === "in-progress") {
      evaluated += record.checkedPracticeAnswers ?? 0;
      correct += record.correctCheckedPracticeAnswers ?? 0;
    }
  }

  const maxMarks = completedScored.length ? completedScored[0].maxMarks : null;
  const comparable = completedScored.length > 0
    && completedScored.every((record) => record.maxMarks === maxMarks);
  const averageScore = comparable
    ? completedScored.reduce((sum, record) => sum + (record.score ?? 0), 0) / completedScored.length
    : null;

  return {
    testsCompleted: completedScored.length,
    questionsAttempted,
    accuracy: evaluated > 0 ? (correct / evaluated) * 100 : null,
    averageScore,
  };
}

export function getSubjectSnapshot(records: ActivityRecord[]) {
  const totals: Partial<Record<SubjectName, { evaluated: number; correct: number }>> = {};
  for (const record of records) {
    for (const [subject, value] of Object.entries(record.subjectResponses ?? {}) as [
      SubjectName,
      { evaluated: number; correct: number },
    ][]) {
      const current = totals[subject] ?? { evaluated: 0, correct: 0 };
      totals[subject] = {
        evaluated: current.evaluated + value.evaluated,
        correct: current.correct + value.correct,
      };
    }
  }
  return totals;
}
