import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './pool-use.module.less';
import { ReactNode } from 'react';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { SldDecimal, SldDecPercent } from '../../../../../../util/decimal';
import { SldProgress } from '../../../../../common/progress/progress';
import { I18n } from '../../../../../i18n/i18n';
import { ItemsBox } from '../../../../../common/content/items-box';
import { progressWidth, progressWidthMobile } from '../../../../const/progress';
import { ShieldPoolInfo, TokenErc20 } from '../../../../../../state-manager/state-types';

type IState = {
  isMobile: boolean;
  isMini: boolean;
};
type IProps = {
  poolTitle: ReactNode;
  token: TokenErc20 | null;
  poolInfo: ShieldPoolInfo | null;
};

export class PoolUseInfo extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isMini: P.Layout.IsMini.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('isMini', P.Layout.IsMini);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const miniCss = this.state.isMini ? styles.mini : '';

    const styleMr = bindStyleMerger(mobileCss, miniCss);

    const percentage: SldDecPercent = this.props.poolInfo
      ? SldDecPercent.fromArgs(this.props.poolInfo?.total, this.props.poolInfo?.available)
      : SldDecPercent.ZERO;

    const { total, available } = this.props.poolInfo
      ? { total: this.props.poolInfo.total, available: this.props.poolInfo.available }
      : { total: SldDecimal.ZERO, available: SldDecimal.ZERO };
    const short = this.state.isMobile;
    const fix = this.state.isMobile ? 2 : 0;

    return (
      <div className={styleMr(styles.wrapperPercent)}>
        <HorizonItem
          label={this.props.poolTitle}
          align={'justify'}
          labelClass={styleMr(styles.title)}
          valueClass={styleMr(styles.title)}
        >
          {/*{this.props.poolInfo?.poolAddress} &nbsp;*/}
          <I18n id={'trade-liquidity-available'} />
        </HorizonItem>

        <ItemsBox gap={this.state.isMobile ? 6 : 8}>
          <HorizonItem
            label={percentage.percentFormat() + '%'}
            align={'justify'}
            labelClass={styleMr(styles.percent)}
            valueClass={styleMr(styles.liquidity)}
          >
            {available.format({ short, fix })}/{total.format({ short, fix })}{' '}
            <span className={styleMr(styles.unit)}>{this.props.token?.symbol}</span>
          </HorizonItem>

          <SldProgress
            strokeWidth={this.state.isMobile ? progressWidthMobile : progressWidth}
            percent={Number(percentage.percentFormat())}
          />
        </ItemsBox>
      </div>
    );
  }
}
