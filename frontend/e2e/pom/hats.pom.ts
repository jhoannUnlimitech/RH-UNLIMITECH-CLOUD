/**
 * Hats POM — Page Object Model for /roles (hats) pages.
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  hats_list: context({
    create_hat_button: key(),
    search_input: key(),
    view_button: key(),
    edit_button: key(),
    delete_button: key(),
  }),
});
