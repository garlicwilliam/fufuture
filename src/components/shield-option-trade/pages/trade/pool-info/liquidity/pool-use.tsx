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
import { PendingHolder } from '../../../../../common/progress/pending-holder';

type IState = {
  isMobile: boolean;
  isMini: boolean;
};
type IProps = {
  poolTitle: ReactNode;
  token: TokenErc20 | null;
  poolInfo: ShieldPoolInfo | null;
  loading: boolean;
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
    const percentageStr: string = percentage.percentFormat();

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
          <I18n id={'trade-liquidity-available'} />
        </HorizonItem>

        <ItemsBox gap={this.state.isMobile ? 6 : 8}>
          <HorizonItem
            label={
              <PendingHolder loading={this.props.loading} height={24} width={100}>
                {percentageStr + '%'}
              </PendingHolder>
            }
            align={'justify'}
            labelClass={styleMr(styles.percent)}
            valueClass={styleMr(styles.liquidity)}
          >
            <PendingHolder loading={this.props.loading} height={24} width={150}>
              <>
                {available.format({ short, fix })}/{total.format({ short, fix })}{' '}
                <span className={styleMr(styles.unit)}>{this.props.token?.symbol}</span>
              </>
            </PendingHolder>
          </HorizonItem>

          <SldProgress
            strokeWidth={this.state.isMobile ? progressWidthMobile : progressWidth}
            percent={this.props.loading ? 0 : Number(percentageStr)}
          />
        </ItemsBox>
      </div>
    );
  }
}
