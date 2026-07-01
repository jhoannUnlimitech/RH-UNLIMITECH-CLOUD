import { describe, it, expect } from 'vitest';
import { createPom, context, key } from './selector-engine';

// ─── Test Schema ────────────────────────────────────────────────────────────

const pom = createPom({
  lead_form: context({
    name_section: context({
      first_name_input: key(),
      last_name_input: key(),
    }),
    email_section: context({
      email_input: key(),
    }),
    phone_section: context({
      phone_input: key(),
    }),
    submit_button: key(),
  }),
  products_table: context({
    table_body: context({
      product_row: key({
        indexed: true,
        children: {
          name_cell: key(),
          price_cell: key(),
        },
      }),
    }),
  }),
  simple_key: key(),
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Selector Engine', () => {

  // ── Basic context navigation ────────────────────────────────────────────

  describe('context nodes', () => {
    it('generates data-test-context for a root context', () => {
      expect(pom.lead_form.$()).toBe('[data-test-context="lead-form"]');
    });

    it('converts snake_case to kebab-case', () => {
      expect(pom.products_table.$()).toBe('[data-test-context="products-table"]');
    });
  });

  // ── Key nodes ───────────────────────────────────────────────────────────

  describe('key nodes', () => {
    it('generates data-test-key for a root key', () => {
      expect(pom.simple_key.$()).toBe('[data-test-key="simple-key"]');
    });

    it('generates data-test-key for a nested key', () => {
      expect(pom.lead_form._.submit_button.$()).toBe(
        '[data-test-context="lead-form"] [data-test-key="submit-button"]'
      );
    });
  });

  // ── Descend (_) ─────────────────────────────────────────────────────────

  describe('descend (_)', () => {
    it('adds space-separated descendant selector', () => {
      expect(pom.lead_form._.name_section.$()).toBe(
        '[data-test-context="lead-form"] [data-test-context="name-section"]'
      );
    });

    it('supports multi-level descent', () => {
      expect(pom.lead_form._.name_section._.first_name_input.$()).toBe(
        '[data-test-context="lead-form"] [data-test-context="name-section"] [data-test-key="first-name-input"]'
      );
    });

    it('supports deep nesting: context → context → context → key', () => {
      expect(pom.products_table._.table_body._.product_row(1)._.name_cell.$()).toBe(
        '[data-test-context="products-table"] [data-test-context="table-body"] [data-test-key="product-row-1"] [data-test-key="name-cell"]'
      );
    });
  });

  // ── States ──────────────────────────────────────────────────────────────

  describe('states', () => {
    it('appends data-test-state to context', () => {
      expect(pom.lead_form.ready.$()).toBe(
        '[data-test-context="lead-form"][data-test-state="ready"]'
      );
    });

    it('appends data-test-state to key', () => {
      expect(pom.lead_form._.submit_button.loading.$()).toBe(
        '[data-test-context="lead-form"] [data-test-key="submit-button"][data-test-state="loading"]'
      );
    });

    it('state after descent works correctly', () => {
      expect(pom.lead_form._.name_section._.first_name_input.error.$()).toBe(
        '[data-test-context="lead-form"] [data-test-context="name-section"] [data-test-key="first-name-input"][data-test-state="error"]'
      );
    });

    it('state on root context before descent', () => {
      expect(pom.lead_form.ready._.name_section.$()).toBe(
        '[data-test-context="lead-form"][data-test-state="ready"] [data-test-context="name-section"]'
      );
    });

    it('supports all known states', () => {
      const states = [
        'loading', 'ready', 'submitting', 'error', 'normal', 'valid', 'invalid',
        'visible', 'hidden', 'authenticated', 'unauthenticated', 'loaded', 'empty',
        'active', 'inactive', 'disabled', 'pending', 'completed', 'failed',
      ];
      for (const s of states) {
        const result = (pom.lead_form as any)[s].$();
        expect(result).toBe(`[data-test-context="lead-form"][data-test-state="${s}"]`);
      }
    });
  });

  // ── Complements (function call on node) ─────────────────────────────────

  describe('complements', () => {
    it('appends a class complement directly (no space)', () => {
      expect(pom.lead_form('.my-class').$()).toBe(
        '[data-test-context="lead-form"].my-class'
      );
    });

    it('appends an attribute complement directly', () => {
      expect(pom.lead_form('[aria-expanded="true"]').$()).toBe(
        '[data-test-context="lead-form"][aria-expanded="true"]'
      );
    });

    it('appends multiple complements', () => {
      expect(pom.lead_form('.classA', '.classB').$()).toBe(
        '[data-test-context="lead-form"].classA.classB'
      );
    });

    it('complement + state combined', () => {
      expect(pom.lead_form('.my-class').ready.$()).toBe(
        '[data-test-context="lead-form"].my-class[data-test-state="ready"]'
      );
    });

    it('complement on nested key', () => {
      expect(pom.lead_form._.phone_section._.phone_input('.wrapper-class').$()).toBe(
        '[data-test-context="lead-form"] [data-test-context="phone-section"] [data-test-key="phone-input"].wrapper-class'
      );
    });

    it('trims whitespace from complements', () => {
      expect(pom.lead_form('  .trimmed  ').$()).toBe(
        '[data-test-context="lead-form"].trimmed'
      );
    });

    it('throws on complement with spaces (descendant attempt)', () => {
      expect(() => pom.lead_form(' .parent .child').$()).toThrow(
        /contains spaces/
      );
    });

    it('throws on complement with internal space', () => {
      expect(() => pom.lead_form('.a .b').$()).toThrow(
        /contains spaces/
      );
    });
  });

  // ── Terminal ($) ────────────────────────────────────────────────────────

  describe('terminal ($)', () => {
    it('returns a string when called without arguments', () => {
      const result = pom.lead_form.$();
      expect(typeof result).toBe('string');
      expect(result).toBe('[data-test-context="lead-form"]');
    });

    it('appends raw CSS suffix when called with argument', () => {
      expect(pom.lead_form._.phone_section._.phone_input.$(' input[type="tel"]')).toBe(
        '[data-test-context="lead-form"] [data-test-context="phone-section"] [data-test-key="phone-input"] input[type="tel"]'
      );
    });

    it('raw suffix can include descendant selectors (spaces)', () => {
      expect(pom.lead_form._.phone_section._.phone_input.$(' .wrapper > input.field')).toBe(
        '[data-test-context="lead-form"] [data-test-context="phone-section"] [data-test-key="phone-input"] .wrapper > input.field'
      );
    });

    it('raw suffix appended directly (no space) when no leading space', () => {
      expect(pom.lead_form._.phone_section._.phone_input.$('.direct-class')).toBe(
        '[data-test-context="lead-form"] [data-test-context="phone-section"] [data-test-key="phone-input"].direct-class'
      );
    });
  });

  // ── Indexed keys ────────────────────────────────────────────────────────

  describe('indexed keys', () => {
    it('generates indexed key selector', () => {
      expect(pom.products_table._.table_body._.product_row(1).$()).toBe(
        '[data-test-context="products-table"] [data-test-context="table-body"] [data-test-key="product-row-1"]'
      );
    });

    it('indexed key with child navigation', () => {
      expect(pom.products_table._.table_body._.product_row(3)._.price_cell.$()).toBe(
        '[data-test-context="products-table"] [data-test-context="table-body"] [data-test-key="product-row-3"] [data-test-key="price-cell"]'
      );
    });

    it('indexed key terminal without index (matches all)', () => {
      expect(pom.products_table._.table_body._.product_row.$()).toBe(
        '[data-test-context="products-table"] [data-test-context="table-body"] [data-test-key="product-row"]'
      );
    });

    it('indexed key with raw suffix', () => {
      expect(pom.products_table._.table_body._.product_row(2).$(' td:first-child')).toBe(
        '[data-test-context="products-table"] [data-test-context="table-body"] [data-test-key="product-row-2"] td:first-child'
      );
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws on unknown child', () => {
      expect(() => (pom.lead_form as any).nonexistent.$()).toThrow(
        /POM: "nonexistent" is not a known child or state/
      );
    });

    it('throws on unknown child after descent', () => {
      expect(() => (pom.lead_form._.name_section as any).nonexistent.$()).toThrow(
        /POM: "nonexistent" is not a known child or state/
      );
    });

    it('error message lists available children', () => {
      try {
        (pom.lead_form._.name_section as any).bad_key.$();
        expect.unreachable('should have thrown');
      } catch (e: any) {
        expect(e.message).toContain('first_name_input');
        expect(e.message).toContain('last_name_input');
      }
    });
  });

  // ── Complex real-world selectors ────────────────────────────────────────

  describe('real-world selectors', () => {
    it('lead form ready state', () => {
      expect(pom.lead_form.ready.$()).toBe(
        '[data-test-context="lead-form"][data-test-state="ready"]'
      );
    });

    it('first name input inside name section', () => {
      expect(pom.lead_form._.name_section._.first_name_input.$()).toBe(
        '[data-test-context="lead-form"] [data-test-context="name-section"] [data-test-key="first-name-input"]'
      );
    });

    it('phone input with raw CSS for third-party component', () => {
      expect(pom.lead_form._.phone_section._.phone_input.$(' .react-international-phone-country-selector-button')).toBe(
        '[data-test-context="lead-form"] [data-test-context="phone-section"] [data-test-key="phone-input"] .react-international-phone-country-selector-button'
      );
    });

    it('submit button with ready state', () => {
      expect(pom.lead_form._.submit_button.ready.$()).toBe(
        '[data-test-context="lead-form"] [data-test-key="submit-button"][data-test-state="ready"]'
      );
    });

    it('product table row cell', () => {
      expect(pom.products_table._.table_body._.product_row(1)._.name_cell.$()).toBe(
        '[data-test-context="products-table"] [data-test-context="table-body"] [data-test-key="product-row-1"] [data-test-key="name-cell"]'
      );
    });
  });
});
