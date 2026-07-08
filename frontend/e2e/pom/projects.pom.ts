/**
 * Projects POM — Page Object Model for /projects pages.
 */
import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  projects_list: context({
    create_project_button: key(),
    search_input: key(),
    view_button: key(),
    edit_button: key(),
    delete_button: key(),
  }),
});
