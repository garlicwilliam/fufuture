import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './my-referral.module.less';
import { fontCss } from '../../../../i18n/font-switch';
import { VerticalItem } from '../../../../common/content/vertical-item';
import { SldButton } from '../../../../common/buttons/sld-button';
import { I18n } from '../../../../i18n/i18n';
import { ShieldBrokerReward, TokenErc20 } from '../../../../../state-manager/state-types';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import { TokenLabel } from '../../common/token-label';
import { Visible } from '../../../../builtin/hidden';
import { Empty } from 'antd';
import { FixPadding } from '../../../../common/content/fix-padding';
import { shieldOptionTradeService } from '../../../services/shield-option-trade.service';
import { D } from '../../../../../state-manager/database/database-state-parser';

type IState = {
  isMobile: boolean;
  rewards: ShieldBrokerReward[];
  inviter: string | null;
  referrals: number;
};
type IProps = {};

export class TradeMyReferral extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    rewards: [],
    inviter: null,
    referrals: 0,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('rewards', S.Option.Broker.MyRewards);
    this.registerState('inviter', S.Option.Broker.MyInviter);
    this.registerState('referrals', D.Option.MyReferrals);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClaim() {
    if (!this.state.rewards || this.state.rewards.length === 0) {
      return;
    }

    const tokens: TokenErc20[] = this.state.rewards.map(one => one.token);
    this.subOnce(shieldOptionTradeService.claimRewards(tokens), done => {
      if (done) {
        this.tickState(S.Option.Broker.MyRewards);
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperReferral)}>
        <div className={styleMr(styles.summary)}>
          <div className={styleMr(styles.title, fontCss.bold)}>
            <I18n id={'trade-summary'} />
          </div>
          <div className={styleMr(styles.content)}>
            <VerticalItem
              label={this.state.rewards.length}
              labelClassName={styleMr(styles.numLabel, fontCss.bold)}
              valueClassName={styleMr(styles.label)}
              gap={'8px'}
            >
              <div>
                <I18n id={'trade-total-tokens'} />
              </div>
            </VerticalItem>

            <div className={styleMr(styles.divider)} />

            <VerticalItem
              label={this.state.referrals}
              labelClassName={styleMr(styles.numLabel, fontCss.bold)}
              valueClassName={styleMr(styles.label)}
              gap={'8px'}
            >
              <div>
                <I18n id={'trade-my-referral-count'} />
              </div>
            </VerticalItem>
          </div>
        </div>

        <div className={styleMr(styles.balance)}>
          <div className={styleMr(styles.title, fontCss.bold)}>
            <I18n id={'trade-commission-balance'} />
          </div>

          <Visible when={this.state.rewards.length === 0}>
            <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
              <Empty />
            </FixPadding>
          </Visible>

          <div className={styleMr(styles.assets)}>
            {this.state.rewards.map((reward, index) => {
              return (
                <div key={index} className={styleMr(styles.assetCard)}>
                  <VerticalItem
                    key={index}
                    label={<TokenLabel token={reward.token} size={this.state.isMobile ? 'tiny' : 'small'} />}
                    labelPos={'bottom'}
                    labelClassName={styleMr(styles.label)}
                    valueClassName={styleMr(styles.num, fontCss.bold)}
                    gap={'10px'}
                  >
                    <span>{reward.amount.format({ fix: 4 })}</span>
                  </VerticalItem>
                </div>
              );
            })}
          </div>

          <div className={styleMr(styles.claim)}>
            <SldButton
              size={'large'}
              type={'primary'}
              disabled={this.state.rewards.length === 0}
              onClick={this.onClaim.bind(this)}
              className={styleMr(styles.btn)}
            >
              <I18n id={'trade-claim-all-commission'} textUpper={'uppercase'} />
            </SldButton>
          </div>
        </div>
      </div>
    );
  }
}
