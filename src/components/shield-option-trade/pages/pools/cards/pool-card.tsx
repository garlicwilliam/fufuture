import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './pool-card.module.less';
import { ReactNode } from 'react';
import { fontCss } from '../../../../i18n/font-switch';
import { RouteKey } from '../../../../../constant/routes';

type IState = {
  isMobile: boolean;
};
type IProps = {
  icon: string;
  iconSize: number;
  title: ReactNode;
  desc: ReactNode;
  targetRoute: RouteKey;
};

export class TradePoolCard extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  navTo() {
    this.navigateTo(this.props.targetRoute);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperCard)} onClick={() => this.navTo()}>
        <div className={styleMr(styles.icon)}>
          <img src={this.props.icon} alt={''} width={this.props.iconSize} />
        </div>

        <div className={styleMr(styles.names)}>
          <div className={styleMr(styles.title, fontCss.bold)}>{this.props.title}</div>
          <div className={styleMr(styles.desc)}>{this.props.desc}</div>
        </div>
      </div>
    );
  }
}
