/**
 * POM — Exam Form Page (/training/manage/exams/new | /edit/:id)
 *
 * Schema de anotaciones data-test-* de la página de crear/editar examen.
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  exam_form_page: context({
    // General fields
    title_input: key(),
    description_input: key(),
    association_type_select: key(),
    level_select: key(),
    course_select: key(),
    document_input: key(),
    passing_score_input: key(),
    max_attempts_input: key(),

    // Questions section
    questions_section: context({
      add_question_btn: key(),
      // Dynamic: question-{index} with nested controls
    }),

    // Form actions
    form_actions: context({
      cancel_btn: key(),
      save_btn: key(),
    }),
  }),
});
