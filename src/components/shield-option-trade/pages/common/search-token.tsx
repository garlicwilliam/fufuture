import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './search-token.module.less';
import { StateNull, TokenErc20 } from '../../../../state-manager/state-types';
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
  tokenSelectList: TokenErc20[];
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
    tokenSelectList: [],
    tokenSearchRs: undefined,
    searchKey: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('tokenSelectList', S.Option.Token.SelectList);
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

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const selectOps: TokenErc20[] = this.state.tokenSelectList;
    const searchRes: TokenErc20 | null = snRep(this.state.tokenSearchRs) || null;
    const searchKey: string | undefined = this.state.searchKey;

    const searchResArr: TokenErc20[] = searchRes ? [searchRes] : [];
    const displayItems: TokenErc20[] = searchKey ? searchResArr : selectOps;

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
              {displayItems.length > 0 ? (
                displayItems.map((token, i) => {
                  return <TokenItem key={i} token={token} onSelected={() => this.onSelect(token)} />;
                })
              ) : (
                <Empty />
              )}
            </div>
          </ItemsBox>
        </ModalRender>
      </>
    );
  }
}
