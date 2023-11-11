import en from './en';
import vi from './vi';
import ru from './ru';
import ko from './ko';
import ja from './ja';
import zh from './zh';
import zhHK from './zhHK';

import { writeFile } from 'fs';

export function sortKeys(langCollection: any, file: string, keepEmpty?: boolean) {
  const standardKeys: Set<string> = new Set(Object.keys(en));

  const lang = langCollection;

  const srcKeys: string[] = keepEmpty ? Array.from(standardKeys) : Object.keys(lang);

  const keys: (keyof typeof lang)[] = srcKeys.sort((a, b) => a.localeCompare(b)) as (keyof typeof lang)[];
  const rs: any = {};

  keys.forEach(key => {
    const valid: boolean = standardKeys.has(key as string) && (lang[key] || keepEmpty);

    if (valid) {
      rs[key] = lang[key] || '';
      if (keepEmpty) {
        console.log(key, '=', rs[key]);
      }
    }
  });

  const jsonStr = JSON.stringify(rs, null, 2);

  writeFile(__dirname + '/' + file + '.json', jsonStr, err => {
    if (err) {
      console.error('err');
    }
  });
}

sortKeys(en, 'en');
sortKeys(vi, 'vi');
sortKeys(ru, 'ru');
sortKeys(ko, 'ko');
sortKeys(ja, 'ja');
sortKeys(zh, 'zh', true);
sortKeys(zhHK, 'zhHK', true);
