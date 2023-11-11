export function normalSerializer(object: any): string {
  return JSON.stringify(object);
}

export function normalParser(str: string): any {
  return JSON.parse(str);
}
