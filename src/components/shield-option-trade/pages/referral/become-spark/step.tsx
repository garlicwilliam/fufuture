import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './step.module.less';
import { ReactNode } from 'react';
import { fontCss } from '../../../../i18n/font-switch';

type IState = {
  isMobile: boolean;
};
type IProps = {
  icon: string;
  title: ReactNode;
  desc: ReactNode;
};

export class SparkStep extends BaseStateComponent<IProps, IState> {
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

    return (
      <div className={styleMr(styles.wrapperStep)}>
        <div className={styleMr(styles.icon)}>
          <img src={this.props.icon} alt={''} width={40} />
        </div>
        <div className={styleMr(styles.title, fontCss.bold)}>{this.props.title}</div>
        <div className={styleMr(styles.desc)}>{this.props.desc}</div>
      </div>
    );
  }
}
