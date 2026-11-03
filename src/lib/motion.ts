const query = matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = (): boolean => query.matches;
export const scrollBehavior = (): ScrollBehavior => (reducedMotion() ? 'auto' : 'smooth');
