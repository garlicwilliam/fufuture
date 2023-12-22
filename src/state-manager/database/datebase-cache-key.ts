export function genDCacheKey(method: string, params?: string): string {
  return `D._m:${method}_param:${params || ''}`;
}
