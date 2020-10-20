import { Comparator as SemVerComparator,  SemVer as BaseSemVer } from 'semver';

declare interface SimpleComparator {
  semver: SemVer;
  operator: string;
  test?: never;
}

export type SemVer = BaseSemVer|number;
export type Comparator = SimpleComparator|SemVerComparator;
export type isComparator = (value: SimpleComparator|SemVerComparator) => value is SemVerComparator;
