import { describe, expect, it } from 'vitest';
import { describeRefreshedAt } from './refreshed-at';

const at = (iso: string) => new Date(iso).getTime();

describe('describeRefreshedAt', () => {
  it('gives the time alone for today', () => {
    expect(
      describeRefreshedAt(at('2026-10-28T14:32'), at('2026-10-28T18:00'), 'en-US')
    ).toBe('2:32 PM');
  });

  it('adds the date for an earlier day', () => {
    expect(
      describeRefreshedAt(at('2026-10-26T09:05'), at('2026-10-28T18:00'), 'en-US')
    ).toBe('Oct 26, 9:05 AM');
  });

  it('adds the year for an earlier year', () => {
    expect(
      describeRefreshedAt(at('2025-12-31T23:59'), at('2026-01-02T08:00'), 'en-US')
    ).toBe('Dec 31, 2025, 11:59 PM');
  });
});
