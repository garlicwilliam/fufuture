export function arrayContains<T>(arr: T[], ele: T): boolean {
  return arr.indexOf(ele) >= 0;
}

export function arrayInteger(count: number, from: number = 1, step: number = 1): number[] {
  return new Array(count).fill(0).map((_, index) => index * step + from);
}

export function arrayGroupBy<T>(arr: T[], groupBy: (el: T, index?: number) => string): { [key: string]: T[] } {
  const flagObject = arr
    .map((e: T, index: number) => {
      const flag: string = groupBy(e, index);
      return [flag, e] as [string, T];
    })
    .reduce((acc: { [k: string]: T[] }, cur: [string, T]) => {
      if (!acc[cur[0]]) {
        acc[cur[0]] = [];
      }

      acc[cur[0]].push(cur[1]);

      return acc;
    }, {} as { [k: string]: T[] });

  return flagObject;
}

export function setAddAll<T>(set: Set<T>, elements: T[]): Set<T> {
  for (const e of elements) {
    set.add(e);
  }

  return set;
}

export function setDelAll<T>(set: Set<T>, elements: T[]): Set<T> {
  for (const e of elements) {
    set.delete(e);
  }

  return set;
}
