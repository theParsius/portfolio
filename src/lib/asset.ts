/** Resolves a base-relative public path ("/projects/x/icon.webp") against the Vite base ("/portfolio/"). */
export const asset = (path: string): string => import.meta.env.BASE_URL + path.replace(/^\//, '');
