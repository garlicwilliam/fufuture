export enum SubGraphType {
  TheGraph = 'thegraph',
  SubQuery = 'subquery',
}

export function subGraphTypeFromUrl(url: string): SubGraphType {
  return url.includes('thegraph') ? SubGraphType.TheGraph : SubGraphType.SubQuery;
}

export function isTheGraphQL(url: string): boolean {
  return subGraphTypeFromUrl(url) === SubGraphType.TheGraph;
}
