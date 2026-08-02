import { createClient } from './supabase/client';
import { projectId } from './supabase/info';
import { LessonPlan, PostLessonReflection, CurriculumTrack } from '../types/lessonPlannerTypes';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/lesson-planner`;

/**
 * Syncs a generated or updated lesson plan to Supabase
 */
export async function syncLessonPlanToSupabase(plan: LessonPlan): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('lesson_plans')
      .upsert({
        id: plan.id,
        teacher_id: plan.teacherId,
        subject: plan.subject,
        grade_class: plan.gradeClass,
        topic: plan.topic,
        subtopic: plan.subtopic,
        duration_minutes: plan.durationMinutes,
        date: plan.date,
        curriculum_framework: plan.curriculumFramework,
        objectives: plan.objectives,
        phases: plan.phases,
        differentiated_instruction: plan.differentiatedInstruction,
        assessment: plan.assessment,
        status: plan.status,
        created_at: plan.createdAt,
        updated_at: new Date().toISOString()
      } as any);

    if (error) {
      console.warn('[LessonPlannerAPI] Supabase table sync warning:', error.message);
    }
    return true;
  } catch (error) {
    console.error('[LessonPlannerAPI] Error syncing lesson plan:', error);
    return false;
  }
}

/**
 * Syncs a post-lesson reflection record to Supabase
 */
export async function syncLessonReflectionToSupabase(reflection: PostLessonReflection): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('lesson_reflections')
      .upsert({
        reflection_id: reflection.reflectionId,
        lesson_id: reflection.lessonId,
        teacher_id: reflection.teacherId,
        completed_as_planned: reflection.completedAsPlanned,
        student_understanding_level: reflection.studentUnderstandingLevel,
        what_worked_well: reflection.whatWorkedWell,
        areas_for_improvement: reflection.areasForImprovement,
        reflected_at: reflection.reflectedAt
      } as any);

    if (error) {
      console.warn('[LessonPlannerAPI] Supabase reflection sync warning:', error.message);
    }
    return true;
  } catch (error) {
    console.error('[LessonPlannerAPI] Error syncing reflection:', error);
    return false;
  }
}
