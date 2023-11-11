import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './pool-item.module.less';
import { ShieldMakerPublicPoolShare } from '../../../../../../state-manager/state-types';
import { SldProgress } from '../../../../../common/progress/progress';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { I18n } from '../../../../../i18n/i18n';
import { progressWidthMobile, progressWidthNarrow } from '../../../../const/progress';
import { TokenLabel } from '../../../common/token-label';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';

type IState = {
  isMobile: boolean;
};
type IProps = {
  pubShare: ShieldMakerPublicPoolShare;
};

export class PoolItem extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onWithdraw() {
    P.Option.Pools.Public.Liquidity.Withdraw.Current.set(this.props.pubShare);
    P.Option.Pools.Public.Liquidity.Withdraw.IsVisible.set(true);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperItem)}>
        <div className={styleMr(styles.title)}>
          <TokenLabel useCopy={true} token={this.props.pubShare.token} size={this.state.isMobile ? 'small' : 'large'} />

          <div className={styleMr(styles.price)}>
            1 {this.props.pubShare.lp.symbol} &nbsp;=&nbsp;
            <TokenAmountInline amount={this.props.pubShare.lpPrice} token={this.props.pubShare.token.symbol} />
          </div>
        </div>

        <div className={styleMr(styles.content)}>
          <div className={styleMr(styles.pubPoolInfo)}>
            <div className={styleMr(styles.highlight)}>{this.props.pubShare.lpShare.percentFormat({ fix: 1 })}%</div>
            <div></div>
            <div>
              <TokenAmountInline amount={this.props.pubShare.lpBalance} short={true} token={''} />/
              <TokenAmountInline
                symClassName={styleMr(styles.unit)}
                amount={this.props.pubShare.lpTotalSupply}
                token={this.props.pubShare.lp.symbol}
                short={true}
              />
            </div>
          </div>

          <SldProgress
            minDisplay={0.5}
            strokeWidth={this.state.isMobile ? progressWidthMobile : progressWidthNarrow}
            percent={Number(this.props.pubShare.lpShare.percentFormat())}
          />
        </div>

        <div className={styleMr(styles.actions)}>
          <SldButton
            size={this.state.isMobile ? 'tiny' : 'small'}
            type={'default'}
            className={styleMr(styles.btnDefault)}
            onClick={() => this.onWithdraw()}
          >
            <I18n id={'trade-liquidity-move-short'} textUpper={'uppercase'} />
          </SldButton>
        </div>
      </div>
    );
  }
}
