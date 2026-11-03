import type { Project, Status } from '../content/types';

export const yearsLabel = ({ years }: Project): string => {
  const end = years.end === 'now' ? 'Now' : String(years.end);
  return years.start === years.end ? end : `${years.start}–${end}`;
};

export const STATUS_LABEL: Record<Status, string> = {
  live: 'Live',
  released: 'Released',
  prototype: 'Prototype',
  jam: 'Game jam',
  unreleased: 'Unreleased',
};

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);

const WORDS = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
];
/** "Seven" for small counts, digits above ten. */
export const countWord = (n: number): string => WORDS[n] ?? String(n);
