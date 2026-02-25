export function isValidSlug(name: string): boolean {
  if (name.includes('..')) {
    return false;
  }
  if (name.endsWith('/') || name.startsWith('/') || name.startsWith('-')) {
    return false;
  }
  if (name.includes('@{') || name.endsWith('.lock')) {
    return false;
  }

  return /^[A-Za-z0-9._/-]+$/.test(name);
}