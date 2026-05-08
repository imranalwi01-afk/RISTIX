import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildIndividualAssessmentUrl,
  getIndividualAssessmentRouteBase,
  INDIVIDUAL_ASSESSMENT_ROUTE,
  INDIVIDUAL_ASSESSMENT_V2_ROUTE,
  isIndividualAssessmentV2Path,
} from './routing';
import { resolveIndividualImpairmentApiMode } from '@/services/api/individual-impairment-scoped-client';

describe('individual impairment frontend routing', () => {
  test('keeps legacy assessment route on v1 by default', () => {
    expect(isIndividualAssessmentV2Path('/banking/individual/assessment')).toBe(false);
    expect(getIndividualAssessmentRouteBase('/banking/individual/assessment')).toBe(INDIVIDUAL_ASSESSMENT_ROUTE);
  });

  test('routes assessment-new links to the v2 UI surface', () => {
    const params = new URLSearchParams({
      mode: 'conventional',
      accountNumber: '000131210158',
      tab: 'assessment-details',
    });

    expect(isIndividualAssessmentV2Path('/banking/individual/assessment-new')).toBe(true);
    expect(buildIndividualAssessmentUrl(params, '/banking/individual/assessment-new')).toBe(
      `${INDIVIDUAL_ASSESSMENT_V2_ROUTE}?mode=conventional&accountNumber=000131210158&tab=assessment-details`,
    );
  });

  test('maps canonical UI routes to the correct backend API generation', () => {
    expect(resolveIndividualImpairmentApiMode('/banking/individual/assessment')).toBe('v1');
    expect(resolveIndividualImpairmentApiMode('/banking/individual/assessment-new')).toBe('v2');
    expect(resolveIndividualImpairmentApiMode('/banking/individual/assessment-new?tab=watchlist')).toBe('v2');
  });

  test('keeps assessment v2 source isolated from legacy assessment pages', () => {
    const repoRoot = process.cwd();
    const frontendRoot = repoRoot.endsWith('packages/frontend')
      ? repoRoot
      : join(repoRoot, 'packages/frontend');
    const files: string[] = [];
    const collectFiles = (path: string) => {
      if (statSync(path).isDirectory()) {
        for (const entry of readdirSync(path)) {
          collectFiles(join(path, entry));
        }
        return;
      }
      if (path.endsWith('.ts') || path.endsWith('.tsx')) {
        files.push(path);
      }
    };

    collectFiles(join(frontendRoot, 'src/app/banking/individual/assessment-new'));
    collectFiles(join(frontendRoot, 'src/components/banking/individual/assessment-v2'));
    files.push(join(frontendRoot, 'src/components/banking/individual/AssessmentOverride.tsx'));

    const forbiddenPatterns = [
      '@/app/banking/individual/assessment/embedded-context',
      '../assessment/embedded-context',
      '../../assessment/embedded-context',
      '../reports/page',
      '../override-trigger/page',
      '/banking/individual/review/',
    ];

    const violations = files.flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return forbiddenPatterns
        .filter((pattern) => source.includes(pattern))
        .map((pattern) => `${file.replace(`${frontendRoot}/`, '')}: ${pattern}`);
    });

    expect(violations).toEqual([]);
  });
});
