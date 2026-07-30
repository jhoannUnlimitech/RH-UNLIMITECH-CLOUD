/**
 * POM — My Progress Page (/training/my-progress)
 *
 * Schema de anotaciones data-test-* de la página de progreso del empleado.
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  my_progress_page: context({
    // Assignments section (conditional: only when assignments exist)
    assignments_section: context({
      // Dynamic: assignment-{id}
    }),

    // Badges section
    badges_section: context({
      // Dynamic: badge-{id}
    }),

    // Current Level section
    current_level_section: context({
      courses_checklist: context({
        // Dynamic: course-{id} with mark_complete_btn
      }),
    }),
  }),
});
