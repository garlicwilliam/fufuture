import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './shield-logo.module.less';
import darkLogo from '../../../../assets/imgs/logo/fufuture-1-dark.svg';
import lightLogo from '../../../../assets/imgs/logo/fufuture-1-light.svg';
import mobileLogo from '../../../../assets/imgs/logo/fufuture-1-light.svg';

type IState = {
  isMobile: boolean;
};
type IProps = {
  isDark?: boolean;
  isHome?: boolean;
};

export class ShieldLogo extends BaseStateComponent<IProps, IState> {
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
    const logoUrl = this.state.isMobile && !this.props.isHome ? mobileLogo : this.props.isDark ? darkLogo : lightLogo;

    return (
      <div className={styleMr(styles.wrapperLogo)}>
        <img src={logoUrl} alt={''} height={this.state.isMobile ? 30 : 40} />
      </div>
    );
  }
}
