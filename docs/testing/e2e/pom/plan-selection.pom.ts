/**
 * Plan Selection Page POM — Plan Selection (Form 3)
 *
 * Page: /sign-up/{sessionId}/plan
 * Component: PlanSelectionPage.tsx
 *
 * Plan cards use unique contexts based on product cname:
 *   plan-individual, plan-general, plan-company, plan-charter, plan-corporate
 *
 * Usage:
 *   pom.plan_selection.ready.$()
 *   pom.plan_selection._.interval_toggle._.monthly_button.active.$()
 *   pom.plan_selection._.plan_company._.plan_price.$()
 *   pom.plan_selection._.plan_company._.choose_plan_button.ready.$()
 */

import { createPom, context, key } from './selector-engine';

// ── Plan card schema (reused for each plan context) ─────────────────────

const planCard = {
  plan_name: key(),
  plan_description: key(),
  plan_price: key(),
  plan_interval_label: key(),
  features_list: key(),
  choose_plan_button: key(),
};

// ── Helper to create a plan card context ────────────────────────────────

function planContext() {
  return context(planCard);
}

// ── POM ─────────────────────────────────────────────────────────────────

export const pom = createPom({
  plan_selection: context({
    // Header
    page_title: key(),
    page_subtitle: key(),

    // Interval toggle
    interval_toggle: context({
      monthly_button: key(),
      annually_button: key(),
    }),

    // Plans grid
    plans_grid: context({
      // One context per product cname (from Products.CName enum)
      plan_individual: planContext(),
      plan_general: planContext(),
      plan_company: planContext(),
      // plan_charter removed — not offered in current enrollment flow
      plan_corporate: planContext(),
    }),

    // Error state (conditional — shown when plan loading fails)
    error_message: key(),
  }),
});
