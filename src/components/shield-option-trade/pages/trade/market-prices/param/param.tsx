import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './param.module.less';
import { TokenIndexPrice } from './parts/token-index-price';
import { DurationSelect } from './parts/duration-select';
import { Resize } from '../../../../../common/utils/resize';
import { DayInfo } from './parts/day-info';

type IState = {
  isMobile: boolean;
  totalWidth: number;
};
type IProps = {};

export class PriceParam extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    totalWidth: 770,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onResize(width: number) {
    this.updateState({ totalWidth: width });
  }

  getSize(): { isNarrow: boolean; useMobile: boolean } {
    return {
      isNarrow: this.state.totalWidth < 670 && this.state.totalWidth > 500 && !this.state.isMobile,
      useMobile: this.state.totalWidth <= 500 || this.state.isMobile,
    };
  }

  render() {
    const { isNarrow, useMobile } = this.getSize();
    const mobileCss = useMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const layout = isNarrow ? 'narrow' : useMobile ? 'mobile' : 'normal';

    return (
      <Resize onResize={w => this.onResize(w)} className={styles.resize}>
        <div className={styleMr(styles.wrapperParam, cssPick(isNarrow, styles.narrow))}>
          <TokenIndexPrice className={styleMr(styles.index)} layoutWidth={this.state.totalWidth} />

          <DayInfo layout={layout} className={styleMr(styles.day)} />

          <DurationSelect
            useMobile={useMobile || isNarrow}
            className={styleMr(styles.select)}
            layoutWidth={this.state.totalWidth}
          />
        </div>
      </Resize>
    );
  }
}
