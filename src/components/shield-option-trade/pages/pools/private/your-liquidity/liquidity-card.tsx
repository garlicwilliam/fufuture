import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './liquidity-card.module.less';
import { SldProgress } from '../../../../../common/progress/progress';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { SldDecPercent } from '../../../../../../util/decimal';
import { I18n } from '../../../../../i18n/i18n';
import { IconSetting } from '../../../../../common/icon/setting';
import { PairLabel } from '../../../common/pair-label';
import { ShieldMakerPrivatePoolInfo, ShieldTradePair } from '../../../../../../state-manager/state-types';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { Visible } from '../../../../../builtin/hidden';
import { ArrowDouble } from '../../../../../common/svg/arrow-double';
import { progressWidthMobile, progressWidthNarrow } from '../../../../const/progress';

type IState = {
  isMobile: boolean;
  isOpen: boolean;
};
type IProps = {
  poolInfo: ShieldMakerPrivatePoolInfo;
};

export class LiquidityCard extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isOpen: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClick() {
    if (this.state.isMobile) {
      this.updateState({ isOpen: !this.state.isOpen });
    }
  }

  onAdd(pair: ShieldTradePair) {
    P.Option.Pools.Private.Liquidity.Add.CurrentPair.set(pair);
    P.Option.Pools.Private.Liquidity.Add.IsVisible.set(true);
  }

  onWithdraw() {
    P.Option.Pools.Private.Liquidity.Withdraw.Current.set(this.props.poolInfo);
    P.Option.Pools.Private.Liquidity.Withdraw.IsVisible.set(true);
  }

  showSetting(event) {
    event.stopPropagation();
    event.preventDefault(true);

    P.Option.Pools.Private.Liquidity.Setting.Current.set(this.props.poolInfo);
    P.Option.Pools.Private.Liquidity.Setting.IsVisible.set(true);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const pair: ShieldTradePair = {
      indexUnderlying: this.props.poolInfo.indexUnderlying,
      quoteToken: this.props.poolInfo.token,
    };
    const percent = SldDecPercent.fromArgs(this.props.poolInfo.amount, this.props.poolInfo.amountAvailable);

    return (
      <div className={styleMr(styles.wrapperCard)} onClick={this.onClick.bind(this)}>
        <div className={styleMr(styles.poolTitle)}>
          <PairLabel pair={pair} size={this.state.isMobile ? 'small' : 'large'} />

          <div />

          <div className={styleMr(styles.setting)} onClick={event => this.showSetting(event)}>
            <IconSetting width={20} />
          </div>
        </div>

        <div className={styleMr(styles.poolContent)}>
          <div className={styleMr(styles.title)}>
            <HorizonItem
              label={<I18n id={'trade-available-rate'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.label)}
            >
              <I18n id={'trade-liquidity-available'} />
            </HorizonItem>
          </div>

          <Visible when={!this.state.isMobile}>
            <div className={styleMr(styles.e)} />
          </Visible>

          <div className={styleMr(styles.available)}>
            <div className={styleMr(styles.info)}>
              <span>
                <span className={styles.highlight}>{percent.percentFormat()}% </span>
              </span>

              <span>
                <TokenAmountInline
                  numClassName={styleMr(styles.line1)}
                  amount={this.props.poolInfo.amountAvailable}
                  token={''}
                />{' '}
                /{' '}
                <TokenAmountInline
                  numClassName={styleMr(styles.line1)}
                  amount={this.props.poolInfo.amount}
                  token={this.props.poolInfo.token.symbol}
                  symClassName={styleMr(styles.unit)}
                />
              </span>
            </div>

            <SldProgress
              strokeWidth={this.state.isMobile ? progressWidthMobile : progressWidthNarrow}
              percent={Number(percent.percentFormat())}
            />
          </div>

          <Visible when={this.state.isOpen || !this.state.isMobile}>
            <div className={styleMr(styles.balance)}>
              <SldButton
                size={'small'}
                type={'primary'}
                className={styleMr(styles.btnOutline)}
                onClick={() => this.onAdd(pair)}
                stopPropagation={true}
              >
                <I18n id={'trade-liquidity-add-short'} textUpper={'uppercase'} />
              </SldButton>

              <SldButton
                size={'small'}
                type={'default'}
                className={styleMr(styles.btnDefault)}
                onClick={() => this.onWithdraw()}
                stopPropagation={true}
              >
                <I18n id={'trade-liquidity-move-short'} textUpper={'uppercase'} />
              </SldButton>
            </div>
          </Visible>

          <Visible when={this.state.isMobile}>
            <div className={styleMr(styles.moreArrow)}>
              <ArrowDouble duration={300} rotate={this.state.isOpen ? 180 : 0} width={12} height={12} />
            </div>
          </Visible>
        </div>
      </div>
    );
  }
}
