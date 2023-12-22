import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './liquidity-setting.module.less';
import ModalRender from '../../../../../modal-render';
import { ItemsBox } from '../../../../../common/content/items-box';
import { ShieldMakerPrivatePoolInfo, ShieldTradePair } from '../../../../../../state-manager/state-types';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { I18n } from '../../../../../i18n/i18n';
import { message, Switch } from 'antd';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { PairLabel } from '../../../common/pair-label';
import { Visible } from '../../../../../builtin/hidden';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { shortAddress } from '../../../../../../util';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Copy } from '../../../../../common/svg/copy';
import { D } from '../../../../../../state-manager/database/database-state-parser';

type IState = {
  isMobile: boolean;
  visible: boolean;
  pool: ShieldMakerPrivatePoolInfo | null;

  isTakingOrders: boolean;
  isExclusive: boolean;
};
type IProps = {
  onDone: (pool: ShieldMakerPrivatePoolInfo) => void;
};

export class LiquiditySetting extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: P.Option.Pools.Private.Liquidity.Setting.IsVisible.get(),
    pool: P.Option.Pools.Private.Liquidity.Setting.Current.get(),

    isTakingOrders: true,
    isExclusive: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('pool', P.Option.Pools.Private.Liquidity.Setting.Current);
    this.registerState('visible', P.Option.Pools.Private.Liquidity.Setting.IsVisible);
    this.registerMultiState(this.mergeState());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeState(): Observable<Partial<IState>> {
    return this.watchStateChange('pool').pipe(
      filter(Boolean),
      map(pool => {
        return { isTakingOrders: !pool.isReject, isExclusive: pool.isExclusive };
      })
    );
  }

  hide() {
    P.Option.Pools.Private.Liquidity.Setting.IsVisible.set(false);
  }

  onSetting() {
    if (
      !this.state.pool ||
      (this.state.pool &&
        this.state.pool.isExclusive === this.state.isExclusive &&
        this.state.pool.isReject === !this.state.isTakingOrders)
    ) {
      return;
    }

    const set$ = shieldOptionTradeService.setMakerPriPool(
      this.state.pool,
      !this.state.isTakingOrders,
      this.state.isExclusive
    );

    const curPool: ShieldMakerPrivatePoolInfo = this.state.pool;

    this.subOnce(set$, (done: boolean) => {
      if (done) {
        // this.tickState(D.Option.Maker.YourLiquidity);
        this.hide();
        this.props.onDone(curPool);
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.state.pool) {
      return <></>;
    }

    const pair: ShieldTradePair = {
      indexUnderlying: this.state.pool.indexUnderlying,
      quoteToken: this.state.pool.token,
    };

    const isChanged =
      this.state.pool.isExclusive !== this.state.isExclusive || this.state.pool.isReject !== !this.state.isTakingOrders;

    return (
      <ModalRender
        title={<I18n id={'trade-pool-private-setting'} />}
        footer={null}
        visible={this.state.visible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
        height={320}
      >
        <ItemsBox gap={16}>
          <Visible when={!!this.state.pool}>
            <FixPadding top={0} bottom={16} mobTop={0} mobBottom={10}>
              <PairLabel pair={pair} size={this.state.isMobile ? 'small' : 'large'} />
            </FixPadding>
          </Visible>

          <HorizonItem
            label={<I18n id={'trade-address-private-pool'} />}
            align={'justify'}
            labelClass={styleMr(styles.label)}
          >
            <div className={styleMr(styles.copyAddress)}>
              <div>{shortAddress(this.state.pool.priPoolAddress)}</div>

              <CopyToClipboard
                text={this.state.pool.priPoolAddress}
                onCopy={() => message.success(<I18n id={'com-copied'} />)}
              >
                <div className={styleMr(styles.copy)}>
                  <Copy />
                </div>
              </CopyToClipboard>
            </div>
          </HorizonItem>

          <HorizonItem
            label={<I18n id={'trade-taking-orders'} textUpper={'capitalize'} />}
            align={'justify'}
            labelClass={styleMr(styles.label)}
          >
            <div className={styleMr(styles.takingOrderValue)}>
              <span>
                {this.state.isTakingOrders ? (
                  <I18n id={'trade-on'} textUpper={'uppercase'} />
                ) : (
                  <I18n id={'trade-off'} textUpper={'uppercase'} />
                )}
              </span>

              <Switch
                checked={this.state.isTakingOrders}
                onChange={(val: boolean) => this.updateState({ isTakingOrders: val })}
              />
            </div>
          </HorizonItem>

          <HorizonItem
            label={<I18n id={'trade-as-exclusive-pool'} textUpper={'capitalize'} />}
            align={'justify'}
            labelClass={styleMr(styles.label)}
          >
            <div className={styleMr(styles.takingOrderValue)}>
              <span>
                {this.state.isExclusive ? (
                  <I18n id={'trade-on'} textUpper={'uppercase'} />
                ) : (
                  <I18n id={'trade-off'} textUpper={'uppercase'} />
                )}
              </span>

              <Switch
                checked={this.state.isExclusive}
                onChange={(val: boolean) => this.updateState({ isExclusive: val })}
              />
            </div>
          </HorizonItem>

          <div></div>

          <SldButton
            size={'large'}
            type={'primary'}
            className={styleMr(styles.btn)}
            disabled={!isChanged}
            onClick={() => this.onSetting()}
          >
            <I18n id={'trade-apply-setting'} textUpper={'uppercase'} />
          </SldButton>
        </ItemsBox>
      </ModalRender>
    );
  }
}
