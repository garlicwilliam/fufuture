export function px(count: number | undefined): string | undefined {
  return count !== undefined ? count + 'px' : '1em';
}

export function clr(fill: string | undefined): string {
  return fill ? fill : 'currentColor';
}
