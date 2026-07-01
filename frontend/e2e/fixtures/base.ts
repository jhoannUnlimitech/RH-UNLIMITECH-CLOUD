/**
 * Base Fixture — createSerialFlow for isolated browser sessions.
 *
 * Provides a shared browser session (page) within a describe.serial block.
 * Supports both headless (Chromium) and CDP (connected Chrome) modes.
 *
 * Usage:
 *   const { e2e, getPage } = createSerialFlow();
 *   e2e.describe.serial('My Flow', () => {
 *     e2e('step 1', myFactory(getPage));
 *     e2e('step 2', anotherFactory(getPage));
 *   });
 */

import { test, type Page, type Browser, type BrowserContext, chromium } from '@playwright/test';

export interface SerialFlow {
  e2e: typeof test;
  getPage: () => Page;
}

export function createSerialFlow(): SerialFlow {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  const e2e = test;

  e2e.beforeAll(async () => {
    const cdpEndpoint = process.env.CDP_ENDPOINT;

    if (cdpEndpoint) {
      // CDP mode: connect to existing Chrome instance
      browser = await chromium.connectOverCDP(cdpEndpoint);
      context = await browser.newContext({
        ignoreHTTPSErrors: true,
      });
    } else {
      // Headless mode: launch new browser
      browser = await chromium.launch({ headless: true });
      context = await browser.newContext({
        ignoreHTTPSErrors: true,
      });
    }

    page = await context.newPage();
  });

  e2e.afterAll(async () => {
    if (context) await context.close();
    if (browser) await browser.close();
  });

  const getPage = (): Page => {
    if (!page) throw new Error('Page not initialized. Ensure beforeAll has run.');
    return page;
  };

  return { e2e, getPage };
}
