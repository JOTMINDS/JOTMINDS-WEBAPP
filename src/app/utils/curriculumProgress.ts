import { CurriculumTopic, LessonPlan, PostLessonReflection } from '../types/lessonPlannerTypes';

export type TopicStatus = CurriculumTopic['status'];

const DELIVERED_STATUSES = ['delivered', 'reviewed', 'completed'];
const STATUS_RANK: Record<TopicStatus, number> = { outstanding: 0, in_progress: 1, covered: 2 };
const STOPWORDS = new Set(['with', 'and', 'the', 'for', 'from', 'into', 'their', 'that', 'this', 'its', 'one', 'two', 'using', 'basic', 'introduction']);

const same = (a?: string, b?: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

function tokens(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w));
}

/**
 * Lessons that teach a topic: those created from the topic, plus lessons for the
 * same subject and class whose title covers most of the topic's key words.
 */
export function linkedLessons(topic: CurriculumTopic, plans: LessonPlan[]): LessonPlan[] {
  const topicWords = tokens(topic.title);
  return plans.filter(plan => {
    if (plan.curriculumTopicId === topic.id) return true;
    if (!same(plan.subject, topic.subject) || !same(plan.gradeClass, topic.grade)) return false;
    if (topicWords.length === 0) return false;
    const planWords = new Set(tokens(`${plan.topic} ${plan.subtopic || ''}`));
    const shared = topicWords.filter(w => planWords.has(w)).length;
    if (topicWords.length === 1) return shared === 1;
    return shared >= 2 && shared / topicWords.length >= 0.5;
  });
}

/**
 * A topic's real status: covered once a linked lesson has been delivered or reflected on,
 * in progress once a lesson is planned for it. A status the teacher set by hand still
 * counts, so topics taught outside the planner can be ticked off.
 */
export function effectiveStatus(
  topic: CurriculumTopic,
  plans: LessonPlan[],
  reflections: PostLessonReflection[],
): { status: TopicStatus; lessons: LessonPlan[]; fromLessons: boolean } {
  const lessons = linkedLessons(topic, plans);
  const reflected = new Set(reflections.map(r => r.lessonId));
  let derived: TopicStatus = 'outstanding';
  if (lessons.some(l => DELIVERED_STATUSES.includes(l.status) || reflected.has(l.id))) derived = 'covered';
  else if (lessons.length > 0) derived = 'in_progress';

  const manual: TopicStatus = topic.status || 'outstanding';
  const status = STATUS_RANK[derived] >= STATUS_RANK[manual] ? derived : manual;
  return { status, lessons, fromLessons: derived !== 'outstanding' && status === derived };
}

export interface CurriculumSummary {
  total: number;
  covered: number;
  inProgress: number;
  outstanding: number;
  percentage: number;
  hoursTotal: number;
  hoursCovered: number;
}

export function summarizeTopics(
  topics: CurriculumTopic[],
  plans: LessonPlan[],
  reflections: PostLessonReflection[],
): CurriculumSummary {
  const summary: CurriculumSummary = { total: topics.length, covered: 0, inProgress: 0, outstanding: 0, percentage: 0, hoursTotal: 0, hoursCovered: 0 };
  topics.forEach(topic => {
    const { status } = effectiveStatus(topic, plans, reflections);
    const hours = topic.estimatedHours || 0;
    summary.hoursTotal += hours;
    if (status === 'covered') { summary.covered++; summary.hoursCovered += hours; }
    else if (status === 'in_progress') summary.inProgress++;
    else summary.outstanding++;
  });
  summary.percentage = summary.total ? Math.round((summary.covered / summary.total) * 100) : 0;
  return summary;
}
