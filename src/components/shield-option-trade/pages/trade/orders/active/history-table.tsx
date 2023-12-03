import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { cssPick, styleMerge } from '../../../../../../util/string';
import styles from './history-table.module.less';
import {
  ShieldHistoryOrderRs,
  ShieldOptionType,
  ShieldOrderInfo,
  ShieldOrderState,
} from '../../../../../../state-manager/state-types';
import { TableForDesktop } from '../../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { formatMinute } from '../../../../../../util/time';
import { I18n } from '../../../../../i18n/i18n';
import { PairLabel } from '../../../common/pair-label';
import { SldDecimal, SldDecPrice } from '../../../../../../util/decimal';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { computeOrderPnl } from '../../../../utils/compute';
import { TableMobileTitle } from '../../../../../table/table-mobile-title';
import { BigNumber } from 'ethers';
import { TableForMobile } from '../../../../../table/table-mobile';
import { map } from 'rxjs/operators';
import { VerticalItem } from '../../../../../common/content/vertical-item';
import { OrderStatusNode } from '../../../../const/status';
import { Observable } from 'rxjs';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { isSameAddress } from '../../../../../../util/address';

type IState = {
  isMobile: boolean;
  curUserAddress: string;
  orders: ShieldHistoryOrderRs | undefined;
  ordersPending: boolean;
};
type IProps = {};

export class HistoryOrderTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curUserAddress: '',
    orders: undefined,
    ordersPending: false,
  };

  private columns: ColumnType<ShieldOrderInfo>[] = [
    {
      title: <I18n id={'trade-order-id'} />,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (id, row: ShieldOrderInfo) => {
        return <span className={styleMerge(styles.label)}>#{id.toString()}</span>;
      },
    },
    {
      title: <I18n id={'trade-column-name-pair'} />,
      dataIndex: 'id',
      key: 'pair',
      align: 'left',
      render: (id, row: ShieldOrderInfo) => {
        return (
          <>
            <PairLabel
              pair={{ indexUnderlying: row.indexUnderlying, quoteToken: row.token }}
              size={'small'}
              hideName={true}
              align={'left'}
              useOverlap={true}
            />
          </>
        );
      },
    },
    {
      title: <I18n id={'trade-order-close-time'} />,
      dataIndex: 'closeTime',
      key: 'closeTime',
      render: (timestamp: number, row: ShieldOrderInfo) => {
        return <>{formatMinute(timestamp)}</>;
      },
    },
    {
      title: <I18n id={'trade-option-type'} />,
      dataIndex: 'optionType',
      key: 'optionType',
      render: (type: ShieldOptionType, row: ShieldOrderInfo) => {
        return type === ShieldOptionType.Call ? (
          <div className={'longStyle'}>
            <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
          </div>
        ) : (
          <div className={'shortStyle'}>
            <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
          </div>
        );
      },
    },
    {
      title: <I18n id={'trade-amount'} />,
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      align: 'right',
      render: (amount: SldDecimal, row: ShieldOrderInfo) => {
        return (
          <TokenAmountInline amount={amount} token={row.indexUnderlying} symClassName={styleMerge(styles.label)} />
        );
      },
    },
    {
      title: <I18n id={'trade-index-open-price'} />,
      dataIndex: 'openPrice',
      key: 'openPrice',
      align: 'right',
      render: (openPrice: SldDecPrice, row: ShieldOrderInfo) => {
        return openPrice.format();
      },
    },
    {
      title: <I18n id={'trade-index-close-price'} />,
      dataIndex: 'closePrice',
      key: 'closePrice',
      align: 'right',
      render: (closePrice: SldDecPrice, row: ShieldOrderInfo) => {
        return closePrice.format();
      },
    },
    {
      title: <I18n id={'trade-fees-funding'} />,
      dataIndex: 'fundingFee',
      key: 'fundingFee',
      align: 'right',
      render: (fundingFee: { paid: SldDecimal }, row: ShieldOrderInfo) => {
        return <TokenAmountInline amount={fundingFee.paid} token={row.token.symbol} symClassName={styles.label} />;
      },
    },
    {
      title: <I18n id={'trade-pnl'} />,
      dataIndex: 'fundingFee',
      key: 'pnl',
      align: 'right',
      render: (fee, row: ShieldOrderInfo) => {
        const { pnl } = computeOrderPnl(row);

        return (
          <TokenAmountInline
            amount={pnl}
            token={row.token.symbol}
            numClassName={pnl.gtZero() ? 'longStyle' : pnl.lt(SldDecimal.ZERO) ? 'shortStyle' : undefined}
            symClassName={styles.label}
          />
        );
      },
    },
    {
      title: <I18n id={'trade-order-status'} />,
      dataIndex: 'orderState',
      key: 'orderState',
      align: 'right',
      render: (state: ShieldOrderState) => {
        return OrderStatusNode[state];
      },
    },
  ];
  private columnsMobile: ColumnType<ShieldOrderInfo>[] = [
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-order-id'} />} />,
      dataIndex: 'id',
      key: 'id',
      render: (id: BigNumber) => {
        return <span className={styleMerge(styles.label)}>#{id.toString()}</span>;
      },
    },
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-column-name-pair'} />} />,
      dataIndex: 'id',
      key: 'pair',
      render: (id: BigNumber, row: ShieldOrderInfo) => {
        return (
          <PairLabel
            pair={{ indexUnderlying: row.indexUnderlying, quoteToken: row.token }}
            size={'tiny'}
            hideName={true}
            align={'left'}
            useOverlap={false}
          />
        );
      },
    },
    {
      title: (
        <TableMobileTitle itemTop={<I18n id={'trade-option-type'} />} itemBottom={<I18n id={'trade-open-time'} />} />
      ),
      dataIndex: 'openTime',
      key: 'time',
      render: (time: number, row: ShieldOrderInfo) => {
        return (
          <div className={styleMerge(styles.cellGroup)}>
            <div
              className={styleMerge(
                cssPick(row.optionType === ShieldOptionType.Call, styles.cellMainLong),
                cssPick(row.optionType === ShieldOptionType.Put, styles.cellMainShort)
              )}
            >
              {row.optionType === ShieldOptionType.Call ? (
                <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
              ) : (
                <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
              )}
            </div>

            <div className={styleMerge(styles.cellDesc)}>{formatMinute(row.closeTime || 0)}</div>
          </div>
        );
      },
    },
    {
      title: (
        <TableMobileTitle
          pullRight={true}
          itemTop={<I18n id={'trade-amount'} />}
          itemBottom={<I18n id={'trade-pnl'} />}
        />
      ),
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      align: 'right',
      render: (amount: SldDecimal, row: ShieldOrderInfo) => {
        return (
          <div className={styles.cellGroup}>
            <div className={styleMerge(styles.cellMain)}>
              <TokenAmountInline
                amount={amount}
                token={row.token.symbol}
                numClassName={styles.value}
                symClassName={styles.cellDesc}
              />
            </div>

            <div className={styleMerge(styles.cellDesc)}>
              <TokenAmountInline
                amount={row.pnl?.pnl}
                token={row.token.symbol}
                numClassName={styleMerge(
                  cssPick(row.pnl?.pnl.gtZero(), styles.cellDescLong),
                  cssPick(row.pnl?.pnl.ltZero(), styles.cellDescShort)
                )}
                symClassName={styles.cellDesc}
              />
            </div>
          </div>
        );
      },
    },
  ];

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('orders', this.mergeOrders());
    this.registerStatePending('ordersPending', D.Option.HistoryOrders);
    this.registerObservable('curUserAddress', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeOrders(): Observable<ShieldHistoryOrderRs> {
    return D.Option.HistoryOrders.watch().pipe(
      map((orders: ShieldHistoryOrderRs) => {
        orders.orders.forEach(order => {
          order.pnl = computeOrderPnl(order);
        });

        return orders;
      })
    );
  }

  onClickMore() {
    P.Option.Trade.OrderHistory.PageIndex.set(P.Option.Trade.OrderHistory.PageIndex.get() + 1);
  }

  rowRender(row: ShieldOrderInfo) {
    const gap = '10px';

    return (
      <div className={styleMerge(styles.extRow)}>
        <VerticalItem
          label={<I18n id={'trade-index-open-price'} />}
          align={'left'}
          labelClassName={styleMerge(styles.label)}
          gap={gap}
        >
          <TokenAmountInline
            amount={row.openPrice}
            token={row.token.symbol}
            numClassName={styles.value}
            symClassName={styles.label}
          />
        </VerticalItem>

        <VerticalItem
          label={<I18n id={'trade-index-close-price'} />}
          align={'right'}
          labelClassName={styleMerge(styles.label)}
          gap={gap}
        >
          <TokenAmountInline
            amount={row.closePrice}
            token={row.token.symbol}
            numClassName={styles.value}
            symClassName={styles.label}
          />
        </VerticalItem>
      </div>
    );
  }

  render() {
    const len = this.state.orders?.orders?.length || 0;
    const index = P.Option.Trade.OrderHistory.PageIndex.get();
    const size = P.Option.Trade.OrderHistory.PageSize.get();
    const maxCount = (index + 1) * size;
    const hasMore = ((this.state.orders?.orders?.length || 0) > 0 && len >= maxCount) || this.state.ordersPending;

    const orderList: ShieldOrderInfo[] | undefined = this.state.orders
      ? isSameAddress(this.state.orders?.taker, this.state.curUserAddress)
        ? this.state.orders.orders
        : undefined
      : undefined;

    return this.state.isMobile ? (
      <TableForMobile
        datasource={orderList}
        columns={this.columnsMobile}
        rowKey={(row: ShieldOrderInfo) => row.id.toString()}
        hasMore={hasMore}
        showMore={this.onClickMore.bind(this)}
        loadingMore={this.state.ordersPending}
        rowRender={this.rowRender.bind(this)}
      />
    ) : (
      <TableForDesktop
        datasource={orderList}
        columns={this.columns}
        rowKey={(row: ShieldOrderInfo) => row.id.toString()}
        hasMore={hasMore}
        showMore={this.onClickMore.bind(this)}
        loadingMore={this.state.ordersPending}
      />
    );
  }
}
