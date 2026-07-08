/**
 * Calendar POM — Page Object Model for /calendar and /calendar/events.
 */
import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  calendar_page: context({
    calendar_view: key(),
  }),
  events_list: context({
    search_input: key(),
    type_filter: key(),
    create_event_button: key(),
    view_button: key(),
    edit_button: key(),
    delete_button: key(),
  }),
});
