import { BaseStateComponent } from '../../state-manager/base-state-component';
import { Language } from '../../constant';
import { P } from '../../state-manager/page/page-state-parser';
import _ from 'lodash';

import en from '../../locale/en';
import ru from '../../locale/ru';
import vi from '../../locale/vi';
import ko from '../../locale/ko';
import ja from '../../locale/ja';
import zh from '../../locale/zh';
import zhHK from '../../locale/zhHK';
import React, { CSSProperties, ReactNode } from 'react';

export type MsgId = keyof typeof en;
export type LangCollection = { [p in MsgId]?: string };
export type ParamObject = { [p: string]: ReactNode };

type IProps = {
  id: MsgId;
  params?: ParamObject;
  appendStr?: string;
  textUpper?: 'uppercase' | 'capitalize' | 'lowercase';
  nowrap?: boolean;
  bolder?: boolean;
};

type IState = {
  isMobile: boolean;
  locale: Language;
};

export class I18n extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: false,
    locale: P.Lang.get(),
  };

  private readonly reg = /(\${[^${}]+})/g;
  private readonly regVar = /(\${([^${}]+)})/;
  private readonly replacement = '&';

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
    return (
      nextProps.id !== this.props.id ||
      !_.isEmpty(nextProps.params) ||
      !_.isEqual(this.props.appendStr, nextProps.appendStr)
    );
  }

  private getCollection(): LangCollection {
    if (window.location.href.indexOf('union.html') >= 0) {
      return en;
    }

    switch (this.state.locale) {
      case Language.En: {
        return en as LangCollection;
      }
      case Language.Ru: {
        return ru as LangCollection;
      }
      case Language.Vi: {
        return vi as LangCollection;
      }
      case Language.Ko: {
        return ko as LangCollection;
      }
      case Language.Ja: {
        return ja as LangCollection;
      }
      case Language.Zh: {
        return zh as LangCollection;
      }
      case Language.ZhHk: {
        return zhHK as LangCollection;
      }
      default: {
        return en;
      }
    }
  }

  private getText(id: MsgId): string {
    const collection = this.getCollection();
    let text = _.get(collection, id, null);
    if (text === null) {
      text = _.get(en, id);
    }

    return text;
  }

  private replaceParam(text: string, params?: ParamObject): ReactNode {
    if (params) {
      const textParts = this.parseText(text);
      if (textParts === null) {
        return text;
      }

      const children: ReactNode[] = [];
      const { segments, vars } = textParts;

      segments.forEach((seg: string, index: number) => {
        const segNode = this.strToNode(seg);

        children.push(segNode);

        if (vars.length > index) {
          const varName: string = vars[index];
          const varVal: ReactNode = params[varName];

          children.push(varVal);
        }
      });

      return React.createElement(React.Fragment, {}, ...children);
    } else {
      return this.strToNode(text);
    }
  }

  private strToNode(htmlStr: string): ReactNode {
    return htmlStr.indexOf('<') >= 0
      ? React.createElement('span', { dangerouslySetInnerHTML: { __html: htmlStr } })
      : htmlStr;
  }

  private parseText(text: string): { segments: string[]; vars: string[] } | null {
    const group: null | RegExpMatchArray = text.match(this.reg);
    if (group !== null) {
      const tempStr: string = text.replace(this.reg, this.replacement);
      const segments: string[] = tempStr.split(this.replacement);
      const vars: string[] = group.map((variable: string) => {
        const groups = variable.match(this.regVar);
        const varName: string = groups ? groups[2] : '';
        return varName;
      });

      return { segments, vars };
    }

    return null;
  }

  render() {
    const text = this.getText(this.props.id);
    const last: ReactNode = this.replaceParam(text, this.props.params);
    const styleCss: CSSProperties = {
      textTransform: this.props.textUpper,
      whiteSpace: this.props.nowrap ? 'nowrap' : undefined,
    };

    return (
      <>
        <span style={styleCss}>
          {last}
          {this.props.appendStr}
        </span>
      </>
    );
  }
}
