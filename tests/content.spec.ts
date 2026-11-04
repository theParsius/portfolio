import { describe, expect, it } from 'vitest';
import { validateContent } from '../scripts/validate-content';
import { projects } from '../src/content/projects';

describe('content', () => {
  it('matches the files in public/ and the spec rules', async () => {
    const { errors } = await validateContent();
    expect(errors).toEqual([]);
  });

  it('keeps the spec level order', () => {
    expect(projects.map((p) => p.id)).toEqual([
      'honeyland',
      'wordfly',
      'dice-fight',
      'the-last-ember',
      'line-up',
      'funtomime',
      'saving-private-teddy',
      'agha-khan',
    ]);
  });
});
