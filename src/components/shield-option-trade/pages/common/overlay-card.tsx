import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../util/string';
import styles from './overlay-card.module.less';

type IState = {
  isMobile: boolean;
};
type IProps = {
  thin?: boolean;
  className?: string;
};

export class OverlayCard extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.wrapperOverlay, cssPick(this.props.thin, styles.thin), this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}
