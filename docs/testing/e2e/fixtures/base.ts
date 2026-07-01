/**
 * Base E2E Fixture — Provides an isolated page per describe.serial block.
 *
 * Each describe.serial gets its own browser context and page via beforeAll/afterAll.
 * Tests within the serial block share the same page — the browser state carries
 * over from one test to the next (previous step leaves the browser ready for the next).
 *
 * In CDP mode:  connects to existing Chrome via CDP_ENDPOINT.
 * In headless:  launches a fresh Chromium with an isolated context per describe.
 *
 * Usage:
 *   import { createSerialFlow } from './fixtures/base';
 *
 *   const { e2e, getPage } = createSerialFlow();
 *
 *   e2e.describe.serial('My Flow', () => {
 *     e2e('step 1', async () => { const page = getPage(); ... });
 *     e2e('step 2', async () => { const page = getPage(); ... });
 *   });
 */

import { test, chromium, type Page, type Browser, type BrowserContext } from '@playwright/test';

export interface SerialFlow {
  /** The test function — use for describe.serial and test declarations */
  e2e: typeof test;
  /** Get the shared page — call inside each test */
  getPage: () => Page;
}

/**
 * Creates an isolated serial flow with its own browser context and page.
 * Each call to createSerialFlow() produces an independent session.
 * Multiple flows can coexist in the same file without collision.
 */
export function createSerialFlow(): SerialFlow {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let isCdp = false;

  test.beforeAll(async () => {
    if (process.env.CDP_ENDPOINT) {
      // CDP mode: connect to existing Chrome, create a NEW context for isolation
      browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT, { timeout: 10_000 });
      context = await browser.newContext({ ignoreHTTPSErrors: true });
      page = await context.newPage();
      isCdp = true;
    } else {
      // Headless mode: launch a fresh browser with isolated context
      browser = await chromium.launch();
      context = await browser.newContext({ ignoreHTTPSErrors: true });
      page = await context.newPage();
    }
  });

  test.afterAll(async () => {
    if (context) await context.close();
    if (browser && !isCdp) await browser.close();
  });

  return {
    e2e: test,
    getPage: () => {
      if (!page) throw new Error('Page not initialized — is this running inside a describe.serial with beforeAll?');
      return page;
    },
  };
}
