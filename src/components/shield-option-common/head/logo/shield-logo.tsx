import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './shield-logo.module.less';

type IState = {
  isMobile: boolean;
};
type IProps = {
  isDark?: boolean;
  isHome?: boolean;
  logoUrl: string;
  height?: number;
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
    const mobileCss = '';
    const styleMr = bindStyleMerger(mobileCss);
    const height: number = this.props.height ? this.props.height : this.state.isMobile ? 28 : 32;

    return (
      <div className={styleMr(styles.logoWrapper)}>
        <img src={this.props.logoUrl} alt={''} height={height} />
      </div>
    );
  }
}
