import en from '../../locale/en';
import ru from '../../locale/ru';
import vi from '../../locale/vi';
import ko from '../../locale/ko';
import ja from '../../locale/ja';
import zh from '../../locale/zh';
import zhHK from '../../locale/zhHK';

import { P } from '../../state-manager/page/page-state-parser';
import { Language } from '../../constant';
import _ from 'lodash';

type MsgId = keyof typeof en;
type LangCollection = { [p in MsgId]?: string };

const langMap = {
  [Language.En]: en,
  [Language.Ru]: ru,
  [Language.Vi]: vi,
  [Language.Ko]: ko,
  [Language.Ja]: ja,
  [Language.Zh]: zh,
  [Language.ZhHk]: zhHK,
};

// not support html format
export function i18n(id: MsgId, params?: { [p: string]: string }): string {
  const lang: Language = P.Lang.get();

  const collection: LangCollection = langMap[lang];

  let text: string | null = _.get(collection, id, null);
  if (text === null) {
    text = _.get(en, id) as string;
  }

  if (params) {
    const vars: string[] = Object.keys(params);
    text = vars.reduce((acc: string, varName: string) => {
      const target = `\${${varName}}`;
      return acc.replace(target, params[varName]);
    }, text);
  }

  return text;
}
