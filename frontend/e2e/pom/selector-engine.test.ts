/**
 * Selector Engine Unit Tests — validates that the POM generates correct CSS selectors.
 *
 * Tests the signin.pom.ts schema specifically and the engine's general behavior.
 * Run with: npx vitest run e2e/pom/selector-engine.test.ts
 */

import { describe, it, expect } from 'vitest';
import { createPom, context, key } from './selector-engine';
import { pom } from './signin.pom';

// ─── SignIn POM Tests ───────────────────────────────────────────────────────

describe('SignIn POM Selectors', () => {
  it('generates signin-page context', () => {
    expect(pom.signin_page.$()).toBe('[data-test-context="signin-page"]');
  });

  it('generates page title key', () => {
    expect(pom.signin_page._.page_title.$()).toBe(
      '[data-test-context="signin-page"] [data-test-key="page-title"]'
    );
  });

  it('generates login-form context', () => {
    expect(pom.signin_page._.login_form.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"]'
    );
  });

  it('generates login-form with ready state', () => {
    expect(pom.signin_page._.login_form.ready.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"][data-test-state="ready"]'
    );
  });

  it('generates login-form with loading state', () => {
    expect(pom.signin_page._.login_form.loading.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"][data-test-state="loading"]'
    );
  });

  it('generates error-message key', () => {
    expect(pom.signin_page._.login_form._.error_message.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-key="error-message"]'
    );
  });

  it('generates error-message with visible state', () => {
    expect(pom.signin_page._.login_form._.error_message.visible.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-key="error-message"][data-test-state="visible"]'
    );
  });

  it('generates email-input key (deep nesting)', () => {
    expect(pom.signin_page._.login_form._.login_inputs._.email_input.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-context="login-inputs"] [data-test-key="email-input"]'
    );
  });

  it('generates password-input key', () => {
    expect(pom.signin_page._.login_form._.login_inputs._.password_input.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-context="login-inputs"] [data-test-key="password-input"]'
    );
  });

  it('generates submit-button with ready state', () => {
    expect(pom.signin_page._.login_form._.login_inputs._.submit_button.ready.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-context="login-inputs"] [data-test-key="submit-button"][data-test-state="ready"]'
    );
  });

  it('generates submit-button with loading state', () => {
    expect(pom.signin_page._.login_form._.login_inputs._.submit_button.loading.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-context="login-inputs"] [data-test-key="submit-button"][data-test-state="loading"]'
    );
  });

  it('generates show-password-toggle key', () => {
    expect(pom.signin_page._.login_form._.login_inputs._.show_password_toggle.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-context="login-inputs"] [data-test-key="show-password-toggle"]'
    );
  });

  it('generates forgot-password-link key', () => {
    expect(pom.signin_page._.login_form._.login_inputs._.forgot_password_link.$()).toBe(
      '[data-test-context="signin-page"] [data-test-context="login-form"] [data-test-context="login-inputs"] [data-test-key="forgot-password-link"]'
    );
  });
});

// ─── Engine General Tests ───────────────────────────────────────────────────

describe('Selector Engine — General', () => {
  const testPom = createPom({
    simple_context: context({
      child_key: key(),
      nested_context: context({
        deep_key: key(),
      }),
    }),
    simple_key: key(),
    indexed_table: context({
      table_body: context({
        row: key({
          indexed: true,
          children: {
            name_cell: key(),
          },
        }),
      }),
    }),
  });

  describe('basic navigation', () => {
    it('context node', () => {
      expect(testPom.simple_context.$()).toBe('[data-test-context="simple-context"]');
    });

    it('key node', () => {
      expect(testPom.simple_key.$()).toBe('[data-test-key="simple-key"]');
    });

    it('nested context', () => {
      expect(testPom.simple_context._.nested_context.$()).toBe(
        '[data-test-context="simple-context"] [data-test-context="nested-context"]'
      );
    });

    it('deeply nested key', () => {
      expect(testPom.simple_context._.nested_context._.deep_key.$()).toBe(
        '[data-test-context="simple-context"] [data-test-context="nested-context"] [data-test-key="deep-key"]'
      );
    });
  });

  describe('states', () => {
    it('appends state to context', () => {
      expect(testPom.simple_context.ready.$()).toBe(
        '[data-test-context="simple-context"][data-test-state="ready"]'
      );
    });

    it('appends state to key', () => {
      expect(testPom.simple_context._.child_key.error.$()).toBe(
        '[data-test-context="simple-context"] [data-test-key="child-key"][data-test-state="error"]'
      );
    });

    it('state before descent', () => {
      expect(testPom.simple_context.loading._.child_key.$()).toBe(
        '[data-test-context="simple-context"][data-test-state="loading"] [data-test-key="child-key"]'
      );
    });
  });

  describe('complements', () => {
    it('appends class', () => {
      expect(testPom.simple_context('.my-class').$()).toBe(
        '[data-test-context="simple-context"].my-class'
      );
    });

    it('throws on spaces in complement', () => {
      expect(() => testPom.simple_context('.a .b').$()).toThrow(/contains spaces/);
    });
  });

  describe('terminal with raw suffix', () => {
    it('appends raw CSS', () => {
      expect(testPom.simple_context._.child_key.$(' input[type="text"]')).toBe(
        '[data-test-context="simple-context"] [data-test-key="child-key"] input[type="text"]'
      );
    });
  });

  describe('indexed keys', () => {
    it('generates indexed key', () => {
      expect(testPom.indexed_table._.table_body._.row(1).$()).toBe(
        '[data-test-context="indexed-table"] [data-test-context="table-body"] [data-test-key="row-1"]'
      );
    });

    it('indexed key with child', () => {
      expect(testPom.indexed_table._.table_body._.row(2)._.name_cell.$()).toBe(
        '[data-test-context="indexed-table"] [data-test-context="table-body"] [data-test-key="row-2"] [data-test-key="name-cell"]'
      );
    });

    it('indexed key without index (matches all)', () => {
      expect(testPom.indexed_table._.table_body._.row.$()).toBe(
        '[data-test-context="indexed-table"] [data-test-context="table-body"] [data-test-key="row"]'
      );
    });
  });

  describe('error handling', () => {
    it('throws on unknown child', () => {
      expect(() => (testPom.simple_context as any).nonexistent.$()).toThrow(
        /POM: "nonexistent" is not a known child or state/
      );
    });
  });
});
