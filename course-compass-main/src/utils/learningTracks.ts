import type { CourseView } from "@/components/common/CourseCard";

export type LearningTrack = {
  slug: string;
  title: string;
  description: string;
  accent: "orange" | "teal" | "cyan" | "blue";
  query: string;
  courses: CourseView[];
};

const levelRank: Record<string, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  Expert: 3,
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getInstructorLabel = (course: CourseView) =>
  typeof course.instructor === "object"
    ? course.instructor?.name || ""
    : course.instructor || course.celebrityTeacher || "";

const matchesAny = (course: CourseView, terms: readonly string[]) => {
  const haystack = normalize(
    `${course.title} ${course.category} ${course.level} ${getInstructorLabel(course)}`
  );
  return terms.some((term) => haystack.includes(normalize(term)));
};

const collectBySequence = (
  courses: CourseView[],
  stages: readonly (readonly string[])[],
) => {
  const seen = new Set<string>();
  const picked: Array<CourseView & { __stage: number }> = [];

  stages.forEach((stageTerms, stageIndex) => {
    courses
      .filter((course) => matchesAny(course, stageTerms) && !seen.has(String(course.id)))
      .sort((left, right) => {
        const leftRank = levelRank[left.level || "Beginner"] ?? 0;
        const rightRank = levelRank[right.level || "Beginner"] ?? 0;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return String(left.title).localeCompare(String(right.title));
      })
      .forEach((course) => {
        seen.add(String(course.id));
        picked.push({ ...course, __stage: stageIndex });
      });
  });

  return picked
    .sort((left, right) => {
      if (left.__stage !== right.__stage) return left.__stage - right.__stage;
      const leftRank = levelRank[left.level || "Beginner"] ?? 0;
      const rightRank = levelRank[right.level || "Beginner"] ?? 0;
      if (leftRank !== rightRank) return leftRank - rightRank;
      return String(left.title).localeCompare(String(right.title));
    })
    .map(({ __stage, ...course }) => course);
};

const trackDefinitions = [
  {
    slug: "master-ai",
    title: "Master AI",
    description:
      "Build from Python and machine learning foundations to deep learning, agents, and production AI.",
    accent: "cyan",
    query: "AI",
    stages: [
      ["Python for Data Analysis", "Data Science Bootcamp"],
      ["Generative AI for Everyone", "Real World Projects on AI Agents"],
      ["Machine Learning A-Z"],
      ["Deep Learning Specialization"],
      ["MLOps & Production AI"],
    ],
  },
  {
    slug: "data-science",
    title: "Data Science",
    description:
      "Move through analytics, model building, and applied machine learning in a practical order.",
    accent: "teal",
    query: "Data Science",
    stages: [
      ["Python for Data Analysis"],
      ["Data Science Bootcamp"],
      ["Machine Learning A-Z"],
      ["Deep Learning Specialization"],
      ["MLOps & Production AI"],
    ],
  },
  {
    slug: "build-products",
    title: "Build Products",
    description:
      "Go from frontend fundamentals to full stack delivery and cloud deployment.",
    accent: "orange",
    query: "Web Dev",
    stages: [
      ["Advanced React Patterns", "Full Stack Web Development"],
      ["UI/UX Design Systems"],
      ["Cloud Computing with AWS", "Cloud & DevOps Essentials"],
      ["Rust for Systems Programming"],
    ],
  },
] as const;

export const deriveLearningTracks = (courses: CourseView[]): LearningTrack[] =>
  trackDefinitions
    .map((definition) => ({
      ...definition,
      courses: collectBySequence(courses, definition.stages),
    }))
    .filter((track) => track.courses.length > 0);
