import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './balance.module.less';
import { I18n } from '../../../../i18n/i18n';
import { fontCss } from '../../../../i18n/font-switch';
import { ShieldUserAccountInfo, TokenErc20 } from '../../../../../state-manager/state-types';
import { FundingState } from './funding-state';
import { ItemsBox } from '../../../../common/content/items-box';
import { FundingData } from './funding-data';
import { UserActions } from './actions/user-actions';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import { PendingHolder } from '../../../../common/progress/pending-holder';

type IState = {
  isMobile: boolean;
  quoteToken: TokenErc20 | null;
  userAccount: ShieldUserAccountInfo | undefined;
};
type IProps = {
  className?: string;
};

export class Balance extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    userAccount: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('userAccount', S.Option.User.Account.Info);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperBalance, this.props.className)}>
        <ItemsBox gap={14}>
          <div className={styleMr(styles.balanceTitle)}>
            <span className={styleMr(fontCss.bold)}>
              <I18n id={'trade-balance-available'} />
            </span>&nbsp;
            <span className={styleMr(fontCss.boldLatin)}>{' (' + this.state.quoteToken?.symbol + ')'}</span>
          </div>

          <div className={styleMr(styles.balanceValue, fontCss.mediumLatin)}>
            <PendingHolder loading={this.state.userAccount === undefined}>
              {this.state.userAccount?.availableBalance.format()}
            </PendingHolder>
          </div>

          <FundingState />

          <FundingData />

          <UserActions />
        </ItemsBox>
      </div>
    );
  }
}
