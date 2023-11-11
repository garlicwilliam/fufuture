import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import { TokenErc20 } from '../../../../state-manager/state-types';
import styles from './token-balance.module.less';
import * as _ from 'lodash';
import { SldDecimal } from '../../../../util/decimal';
import { Visible } from '../../../builtin/hidden';
import { LoadingOutlined } from '@ant-design/icons';
import { tokenBalanceService } from '../../services/token-balance.service';

type IState = {
  isMobile: boolean;
  balance: SldDecimal | undefined;
};
type IProps = {
  token: TokenErc20;
  className?: string;
};

export class TokenBalance extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    balance: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.updateBalance();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (!_.isEqual(this.props.token, prevProps.token)) {
      this.updateBalance();
    }
  }

  updateBalance() {
    const balance$ = tokenBalanceService.watchTokenBalance(this.props.token);
    this.subWithId(balance$, 'balance', (balance: SldDecimal) => {
      this.updateState({ balance });
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={this.props.className}>
        <Visible when={this.state.balance === undefined}>
          <LoadingOutlined />
        </Visible>

        <Visible when={!!this.state.balance}>
          <div className={'sld-token-balance-value'}>{this.state.balance?.format({ fix: 4, floor: true })}</div>
        </Visible>
      </div>
    );
  }
}
