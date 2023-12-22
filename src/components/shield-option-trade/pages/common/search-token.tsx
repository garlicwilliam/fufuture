import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './search-token.module.less';
import { ShieldTokenSearchList, StateNull, TokenErc20 } from '../../../../state-manager/state-types';
import { IconDropdown } from '../../../common/icon/dropdown';
import { Visible } from '../../../builtin/hidden';
import { TokenLabel } from './token-label';
import ModalRender from '../../../modal-render';
import { ItemsBox } from '../../../common/content/items-box';
import { StringInput } from '../../../common/input/string-input';
import { i18n } from '../../../i18n/i18n-fn';
import { I18n } from '../../../i18n/i18n';
import { S } from '../../../../state-manager/contract/contract-state-parser';
import { Empty } from 'antd';
import { isValidAddress } from '../../../../util/address';
import { snRep } from '../../../../state-manager/interface-util';
import { TokenBalance } from './token-balance';
import { ReactNode } from 'react';
import { SldEmpty } from '../../../common/content/empty';
import { Network } from '../../../../constant/network';
import { walletState } from '../../../../state-manager/wallet/wallet-state';
import { ShieldLoading } from './loading';

type TProps = {
  token: TokenErc20;
  onSelected?: (token: TokenErc20) => void;
};
type TState = {
  isMobile: boolean;
};

class TokenItem extends BaseStateComponent<TProps, TState> {
  state: TState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<TProps>, prevState: Readonly<TState>, snapshot?: any) {}

  onSelect() {
    if (this.props.onSelected) {
      this.props.onSelected(this.props.token);
    }
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.tokenItem)} onClick={this.onSelect.bind(this)}>
        <TokenLabel useCopy={true} token={this.props.token} size={'small'} />
        <TokenBalance token={this.props.token} className={styleMr(styles.balance)} />
      </div>
    );
  }
}

type IState = {
  isMobile: boolean;
  visible: boolean;
  network: Network | null;
  tokenSelectList: ShieldTokenSearchList | undefined;
  tokenSelectListPending: boolean;
  tokenSearchRs: TokenErc20 | typeof StateNull | undefined;
  searchKey: string | undefined;
};
type IProps = {
  onSelected?: (token: TokenErc20) => void;
  curSelected?: TokenErc20;
  placeholder?: ReactNode;
};

export class SearchToken extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: false,
    network: null,
    tokenSelectList: undefined,
    tokenSelectListPending: false,
    tokenSearchRs: undefined,
    searchKey: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('network', walletState.NETWORK);
    this.registerState('tokenSelectList', S.Option.Token.SelectList);
    this.registerStatePending('tokenSelectListPending', S.Option.Token.SelectList);
    this.registerState('tokenSearchRs', S.Option.Token.Search);
    this.registerState('searchKey', P.Option.Token.Search);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  hide() {
    this.updateState({ visible: false });
  }

  show() {
    this.updateState({ visible: true });
  }

  onSelect(token: TokenErc20) {
    this.hide();

    if (this.props.onSelected) {
      this.props.onSelected(token);
    }

    P.Option.Token.Search.set(undefined);
  }

  onChangeSearchKey(key: string) {
    P.Option.Token.Search.set(key);
  }

  private searchRs(): TokenErc20 | null | undefined {
    if (!this.state.searchKey || this.state.tokenSearchRs === undefined) {
      return undefined;
    }

    const searchRs = snRep(this.state.tokenSearchRs);

    if (searchRs === null) {
      return null;
    }

    if (searchRs.network !== this.state.network) {
      return null;
    }

    return searchRs;
  }

  private selections(): TokenErc20[] | undefined {
    if (
      this.state.tokenSelectList === undefined ||
      this.state.tokenSelectList.network !== this.state.network ||
      this.state.tokenSelectListPending
    ) {
      return undefined;
    }

    return this.state.tokenSelectList.tokens;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const searchKey: string | undefined = this.state.searchKey;
    const searchRes: TokenErc20 | null | undefined = this.searchRs();
    const selection: TokenErc20[] | undefined = this.selections();
    const items: TokenErc20[] | undefined = searchRes ? [searchRes] : selection;

    return (
      <>
        <div className={styleMr(styles.wrapperSearch)} onClick={() => this.show()}>
          <Visible when={!!this.props.curSelected}>
            <TokenLabel size={'small'} token={this.props.curSelected!} />
          </Visible>

          <Visible when={!this.props.curSelected}>
            <div className={styleMr(styles.placeholder)}>{this.props.placeholder}</div>
          </Visible>

          <div className={styleMr(styles.dropdown)}>
            <IconDropdown width={10} />
          </div>
        </div>

        <ModalRender
          footer={null}
          title={<I18n id={'trade-select-token'} />}
          visible={this.state.visible}
          onClose={this.hide.bind(this)}
          onCancel={this.hide.bind(this)}
          height={400}
        >
          <ItemsBox gap={this.state.isMobile ? 20 : 30}>
            <StringInput
              className={styleMr(styles.searchForm)}
              placeholder={i18n('trade-input-placeholder-search-by-token')}
              onChange={(key: string) => this.onChangeSearchKey(key)}
              value={searchKey}
              isError={!!searchKey && !isValidAddress(searchKey)}
            />

            <div className={styleMr(styles.tokenOptionList)}>
              {items === undefined ? (
                <ShieldLoading size={40} />
              ) : items.length > 0 ? (
                items.map((token, i) => {
                  return <TokenItem key={i} token={token} onSelected={() => this.onSelect(token)} />;
                })
              ) : (
                <SldEmpty />
              )}
            </div>
          </ItemsBox>
        </ModalRender>
      </>
    );
  }
}
