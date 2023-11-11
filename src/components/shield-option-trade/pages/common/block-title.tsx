import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './block-title.module.less';
import { ReactNode } from 'react';
import { fontCss } from '../../../i18n/font-switch';

type IState = {
  isMobile: boolean;
};
type IProps = {
  title: ReactNode;
};

export class BlockTitle extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return <div className={styleMr(styles.wrapperTitle, fontCss.bold)}>{this.props.title}</div>;
  }
}
