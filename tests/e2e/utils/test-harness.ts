import { test as base, Page, TestInfo } from '@playwright/test';

/**
 * Test harness for capturing errors, console logs, and failed requests
 */

export interface ConsoleLogs {
  errors: string[];
  warnings: string[];
  info: string[];
}

export interface FailedRequest {
  url: string;
  method: string;
  failure: string;
  resourceType: string;
}

export interface TestContext {
  consoleLogs: ConsoleLogs;
  pageErrors: Error[];
  failedRequests: FailedRequest[];
}

/**
 * Setup error capture listeners on a page
 */
export function setupErrorCapture(page: Page): TestContext {
  const context: TestContext = {
    consoleLogs: {
      errors: [],
      warnings: [],
      info: [],
    },
    pageErrors: [],
    failedRequests: [],
  };

  // Capture console logs
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      context.consoleLogs.errors.push(text);
    } else if (type === 'warning') {
      context.consoleLogs.warnings.push(text);
    } else {
      context.consoleLogs.info.push(text);
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', (error) => {
    context.pageErrors.push(error);
  });

  // Capture failed requests
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    context.failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: failure?.errorText || 'Unknown error',
      resourceType: request.resourceType(),
    });
  });

  return context;
}

/**
 * Attach error logs and screenshots on test failure
 */
export async function attachErrorArtifacts(
  page: Page,
  testInfo: TestInfo,
  context: TestContext
): Promise<void> {
  // Only attach if test failed
  if (testInfo.status !== 'failed') return;

  // Attach console errors
  if (context.consoleLogs.errors.length > 0) {
    await testInfo.attach('console-errors', {
      body: JSON.stringify(context.consoleLogs.errors, null, 2),
      contentType: 'application/json',
    });
  }

  // Attach console warnings
  if (context.consoleLogs.warnings.length > 0) {
    await testInfo.attach('console-warnings', {
      body: JSON.stringify(context.consoleLogs.warnings, null, 2),
      contentType: 'application/json',
    });
  }

  // Attach page errors
  if (context.pageErrors.length > 0) {
    await testInfo.attach('page-errors', {
      body: JSON.stringify(
        context.pageErrors.map((e) => ({
          message: e.message,
          stack: e.stack,
        })),
        null,
        2
      ),
      contentType: 'application/json',
    });
  }

  // Attach failed requests
  if (context.failedRequests.length > 0) {
    await testInfo.attach('failed-requests', {
      body: JSON.stringify(context.failedRequests, null, 2),
      contentType: 'application/json',
    });
  }

  // Take a full-page screenshot
  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('failure-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  } catch {
    // Page might be closed, ignore screenshot error
  }
}

/**
 * Extended test with automatic error capture
 */
export const test = base.extend<{ testContext: TestContext }>({
  testContext: async ({ page }, use, testInfo) => {
    const context = setupErrorCapture(page);

    // Use the context in tests
    await use(context);

    // After test: attach artifacts if failed
    await attachErrorArtifacts(page, testInfo, context);
  },
});

/**
 * Helper to assert no critical errors occurred
 */
export function assertNoCriticalErrors(context: TestContext): void {
  // Filter out known non-critical errors
  const criticalErrors = context.consoleLogs.errors.filter(
    (error) =>
      !error.includes('favicon') &&
      !error.includes('404') &&
      !error.includes('Failed to load resource')
  );

  const criticalPageErrors = context.pageErrors.filter(
    (error) =>
      !error.message.includes('Script error') &&
      !error.message.includes('ResizeObserver')
  );

  if (criticalErrors.length > 0 || criticalPageErrors.length > 0) {
    const errorSummary = [
      ...criticalErrors.map((e) => `Console: ${e}`),
      ...criticalPageErrors.map((e) => `Page: ${e.message}`),
    ].join('\n');

    throw new Error(`Critical errors detected:\n${errorSummary}`);
  }
}

/**
 * Performance measurement helper
 */
export async function measureElementAppearance(
  page: Page,
  selector: string,
  timeout = 30000
): Promise<number> {
  const start = Date.now();

  await page.waitForSelector(selector, { state: 'visible', timeout });

  return Date.now() - start;
}

/**
 * Check for horizontal overflow (useful for mobile tests)
 */
export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    return body.scrollWidth > html.clientWidth;
  });
}

/**
 * Get all elements that overflow their container
 */
export async function getOverflowingElements(
  page: Page
): Promise<{ tag: string; class: string; overflow: number }[]> {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const elements: { tag: string; class: string; overflow: number }[] = [];

    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth + 5) {
        elements.push({
          tag: el.tagName.toLowerCase(),
          class: el.className?.toString() || '',
          overflow: rect.right - viewportWidth,
        });
      }
    });

    return elements.slice(0, 10); // Return max 10 elements
  });
}

// Re-export expect from base
export { expect } from '@playwright/test';
