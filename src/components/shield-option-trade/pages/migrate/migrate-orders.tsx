import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../util/string';
import {
  ShieldActiveOrderInfo,
  ShieldActiveOrderInfoRs,
  ShieldOptionType,
  ShieldOrderMigration,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../../state-manager/state-types';
import { D } from '../../../../state-manager/database/database-state-parser';
import styles from './migrate-orders.module.less';
import { ColumnType } from 'antd/lib/table/interface';
import { I18n } from '../../../i18n/i18n';
import { BigNumber } from 'ethers';
import { TableForDesktop } from '../../../table/table-desktop';
import { SldDecimal, SldDecPrice } from '../../../../util/decimal';
import { curTimestamp, displayDuration, formatMinute, formatTime } from '../../../../util/time';
import { TokenAmountInline } from '../../../common/content/token-amount-inline';
import { SldButton } from '../../../common/buttons/sld-button';
import { AssetsSelect } from '../common/assets-select';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { shieldOptionTradeService } from '../../services/shield-option-trade.service';
import { Observable } from 'rxjs';
import { TokenCheckBox } from '../common/token-check-box';

type IState = {
  isMobile: boolean;
  orderRs: ShieldActiveOrderInfoRs | undefined;
  orderRsPending: boolean;
  pageSize: number;

  underlying: ShieldUnderlyingType;
  settleOnly: boolean;
  exToken: Set<string>;
};
type IProps = {};

export class MigrateOrders extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    orderRs: undefined,
    orderRsPending: false,
    pageSize: 20,

    underlying: P.Option.Migrate.Underlying.get(),
    settleOnly: false,
    exToken: new Set<string>(),
  };

  private columns: ColumnType<ShieldActiveOrderInfo>[] = [
    {
      title: <I18n id={'trade-order-id'} />,
      dataIndex: 'id',
      key: 'id',
      render: (id: BigNumber, row: ShieldActiveOrderInfo) => {
        return id.toString();
      },
    },
    {
      title: <I18n id={'trade-column-name-pair'} />,
      dataIndex: 'underlying',
      key: 'underlying',
      render: (underlying: ShieldUnderlyingType, row: ShieldActiveOrderInfo) => {
        return `${underlying}/${row.token.symbol}`;
      },
    },
    {
      title: <I18n id={'trade-option-type'} />,
      dataIndex: 'optionType',
      key: 'optionType',
      render: (optionType: ShieldOptionType, row: ShieldActiveOrderInfo) => {
        return optionType === ShieldOptionType.Call ? (
          <span className={styles.long}>
            <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
          </span>
        ) : (
          <span className={styles.short}>
            <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
          </span>
        );
      },
    },
    {
      title: <I18n id={'trade-amount'} />,
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      render: (amount: SldDecimal, row: ShieldActiveOrderInfo) => {
        return amount.format();
      },
    },
    {
      title: <I18n id={'trade-open-time'} />,
      dataIndex: 'openTime',
      key: 'openTime',
      render: (openTime: number, row: ShieldActiveOrderInfo) => {
        return formatMinute(openTime);
      },
    },
    {
      title: <I18n id={'trade-index-open-price'} />,
      dataIndex: 'openPrice',
      key: 'openPrice',
      render: (openPrice: SldDecPrice, row: ShieldActiveOrderInfo) => {
        return openPrice.format();
      },
    },
    {
      title: <I18n id={'trade-fees-trading'} />,
      dataIndex: 'tradingFee',
      key: 'tradingFee',
      render: (tradingFee: SldDecimal, row: ShieldActiveOrderInfo) => {
        return <TokenAmountInline amount={tradingFee} token={row.token.symbol} symClassName={styles.label} />;
      },
    },
    {
      title: <I18n id={'trade-funding-fee-paid'} />,
      dataIndex: 'fundingFeePaid',
      key: 'fundingFeePaid',
      render: (fundingFeePaid: SldDecimal, row: ShieldActiveOrderInfo) => {
        return <TokenAmountInline amount={fundingFeePaid} token={row.token.symbol} symClassName={styles.label} />;
      },
    },
    {
      title: <I18n id={'trade-funding-fee-settlement-last'} />,
      dataIndex: 'migrationInfo',
      key: 'migrationInfo',
      render: (migration: ShieldOrderMigration, row: ShieldActiveOrderInfo) => {
        return formatMinute(migration.lastSettlementTime);
      },
    },
    {
      title: <I18n id={'trade-funding-fee-need-settlement'} />,
      dataIndex: 'migrationInfo',
      key: 'needMigrate',
      render: (migration: ShieldOrderMigration, row: ShieldActiveOrderInfo) => {
        const need: boolean = curTimestamp() > migration.scheduleSettleTime;
        const delta = need ? 0 : migration.scheduleSettleTime - curTimestamp();
        const deltaTime = displayDuration(delta);

        return need ? (
          <SldButton size={'tiny'} type={'none'} className={styles.btnOutline} onClick={() => this.onSettle([row.id])}>
            <I18n id={'trade-funding-fee-settlement'} />
          </SldButton>
        ) : (
          <I18n
            id={'trade-time-after'}
            params={{
              time: (
                <>
                  <I18n id={'trade-hours'} params={{ num: deltaTime.hours }} />{' '}
                  <I18n id={'trade-minutes'} params={{ num: deltaTime.minutes }} />
                </>
              ),
            }}
          />
        );
      },
    },
  ];

  componentDidMount(): void {
    this.registerIsMobile('isMobile');
    this.registerState('orderRs', D.Option.MigrationOrders);
    this.registerStatePending('orderRsPending', D.Option.MigrationOrders);
    this.registerState('underlying', P.Option.Migrate.Underlying);
    this.registerState('settleOnly', P.Option.Migrate.SettleOnly);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onChangeSettleOnly(event: CheckboxChangeEvent) {
    const nextVal: boolean = event.target.checked;
    P.Option.Migrate.SettleOnly.set(nextVal);
  }

  genSourceData(): {
    source: ShieldActiveOrderInfo[] | undefined;
    needSettleCount: number;
    needSettle: BigNumber[];
    tokens: TokenErc20[];
  } {
    const current: number = curTimestamp();
    const primaryOrders: ShieldActiveOrderInfo[] | undefined = this.state.orderRs?.orders;
    const allOrders: ShieldActiveOrderInfo[] | undefined =
      this.state.exToken.size > 0
        ? primaryOrders?.filter(one => !this.state.exToken.has(one.token.address))
        : primaryOrders || [];

    const needSettle: ShieldActiveOrderInfo[] = (allOrders || []).filter(
      (one: ShieldActiveOrderInfo): boolean => one.migrationInfo.scheduleSettleTime < current
    );

    const datasource: ShieldActiveOrderInfo[] | undefined = this.state.settleOnly ? needSettle : allOrders;
    const tokens: Set<TokenErc20> = new Set();

    primaryOrders?.forEach(one => {
      tokens.add(one.token);
    });

    return {
      source: datasource,
      needSettleCount: needSettle.length,
      needSettle: needSettle.map(one => one.id),
      tokens: Array.from(tokens),
    };
  }

  onSettle(ids: BigNumber[]) {
    const migrate$: Observable<boolean> = shieldOptionTradeService.migration(ids);
    this.subOnce(migrate$, (done: boolean) => {
      if (done) {
        D.Option.MigrationOrders.tick();
      }
    });
  }

  onExTokenCheck(checked: boolean, token: TokenErc20): void {
    if (checked) {
      this.state.exToken.add(token.address);
    } else {
      this.state.exToken.delete(token.address);
    }

    this.updateState({ exToken: this.state.exToken });
  }

  render() {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    const { source, needSettleCount, needSettle, tokens } = this.genSourceData();

    return (
      <div className={styleMr(styles.listWrapper)}>
        <div className={styleMr(styles.topGrid)}>
          <div>
            <I18n id={'trade-migrate-selector-underlying'} />
          </div>
          <div>
            <I18n id={'trade-migrate-selector-need'} />
          </div>
          <div>
            <I18n id={'trade-migrate-exclude-token'} />
          </div>
          <div>
            <I18n id={'trade-migrate-batch-action'} />
          </div>

          <AssetsSelect
            curSelect={this.state.underlying}
            onSelect={(underlying: ShieldUnderlyingType) => P.Option.Migrate.Underlying.set(underlying)}
          />

          <div className={styleMr(styles.checkbox)}>
            <Checkbox checked={this.state.settleOnly} onChange={this.onChangeSettleOnly.bind(this)} />
          </div>

          <div className={styleMr(styles.exTokens)}>
            {tokens.map((token: TokenErc20) => {
              return (
                <TokenCheckBox
                  key={token.address}
                  token={token}
                  checked={(checked: boolean) => this.onExTokenCheck(checked, token)}
                  curChecked={this.state.exToken.has(token.address)}
                />
              );
            })}
          </div>

          <div>
            <SldButton
              size={'small'}
              type={'primary'}
              className={styleMr(styles.btn)}
              onClick={() => this.onSettle(needSettle)}
            >
              <I18n id={'trade-funding-fee-settlement'} />
              &nbsp;({needSettleCount})
            </SldButton>
          </div>
        </div>

        <TableForDesktop
          rowKey={(row: ShieldActiveOrderInfo) => row.id.toString()}
          datasource={source}
          columns={this.columns}
          loading={this.state.orderRsPending}
          pagination={{
            pageSize: this.state.pageSize,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (page: number, size: number) => this.updateState({ pageSize: size }),
          }}
        />
      </div>
    );
  }
}
