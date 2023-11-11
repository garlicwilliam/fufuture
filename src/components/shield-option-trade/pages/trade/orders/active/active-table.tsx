import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { TableForDesktop } from '../../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import { ShieldOptionType, ShieldOrderInfo, TokenErc20 } from '../../../../../../state-manager/state-types';
import { I18n } from '../../../../../i18n/i18n';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { formatDate } from '../../../../../../util/time';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { SldDecimal, SldDecPrice } from '../../../../../../util/decimal';
import { map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { IndexUnderlyingType } from '../../../../const/assets';
import { computeOrderPnl } from '../../../../utils/compute';
import { cssPick, styleMerge } from '../../../../../../util/string';
import { TextBtn } from '../../../../../common/buttons/text-btn';
import { CloseOrderConfirm } from './close-confirm';
import { PairLabel } from '../../../common/pair-label';
import { ReactNode } from 'react';
import styles from './active-table.module.less';
import { shieldOrderService } from '../../../../services/shield-order.service';
import { TableMobileTitle } from '../../../../../table/table-mobile-title';
import { TableForMobile } from '../../../../../table/table-mobile';
import { BigNumber } from '@ethersproject/bignumber';
import { VerticalItem } from '../../../../../common/content/vertical-item';
import { OrderFundingSchedule } from './funding-schedule';
import { ShareOrder } from '../../../share/share';
import { SharePopup } from '../../../share/share-popup';

type IState = {
  isMobile: boolean;
  orders: ShieldOrderInfo[] | undefined;
};
type IProps = {};

export class ActiveOrderTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    orders: undefined,
  };

  //private columns = [];
  columns: ColumnType<ShieldOrderInfo>[] = [
    {
      title: <I18n id={'trade-order-id'} />,
      dataIndex: 'id',
      key: 'id',
      render: (id: BigNumber, row: ShieldOrderInfo) => {
        return <span className={styleMerge(styles.label)}>#{id.toString()}</span>;
      },
    },
    {
      title: <I18n id={'trade-column-name-pair'} />,
      dataIndex: 'openTime',
      key: 'openTime',
      render: (timestamp: number, row: ShieldOrderInfo) => {
        return (
          <PairLabel
            pair={{ indexUnderlying: row.indexUnderlying, quoteToken: row.token }}
            size={'small'}
            hideName={true}
            useOverlap={true}
            align={'left'}
          />
        );
      },
    },
    {
      title: (
        <>
          <I18n id={'trade-type'} />/<I18n id={'trade-time'} />
        </>
      ),
      dataIndex: 'optionType',
      key: 'optionType',
      render: (type: ShieldOptionType, row: ShieldOrderInfo) => {
        const typeDom: ReactNode =
          type === ShieldOptionType.Call ? (
            <div className={styles.optionTypeLong}>
              <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
            </div>
          ) : (
            <div className={styles.optionTypeShort}>
              <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
            </div>
          );
        const timeDom: ReactNode = <div className={styles.openTime}>{formatDate(row.openTime, 'MM-DD HH:mm')}</div>;

        return (
          <div className={styles.optionTypeGroup}>
            {typeDom}
            {timeDom}
          </div>
        );
      },
    },
    {
      title: <I18n id={'trade-amount'} />,
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      align: 'right',
      render: (amount: SldDecimal, row: ShieldOrderInfo) => (
        <TokenAmountInline token={row.indexUnderlying} amount={amount} symClassName={styles.label} short={true} />
      ),
    },
    {
      title: <I18n id={'trade-fees-trading'} />,
      dataIndex: 'tradingFee',
      key: 'tradingFee',
      align: 'right',
      render: (tradingFee: SldDecimal, row: ShieldOrderInfo) => (
        <TokenAmountInline amount={tradingFee} token={row.token.symbol} symClassName={styles.label} short={true} />
      ),
    },
    {
      title: <I18n id={'trade-index-open-price'} />,
      dataIndex: 'openPrice',
      key: 'openPrice',
      align: 'right',
      render: (price: SldDecPrice, row: ShieldOrderInfo) => {
        return <TokenAmountInline amount={price} token={''} />;
      },
    },
    {
      title: <I18n id={'trade-index-mark-price'} />,
      dataIndex: 'markPrice',
      key: 'markPrice',
      align: 'right',
      render: (price: SldDecPrice, row: ShieldOrderInfo) => <TokenAmountInline amount={price} token={''} />,
    },
    {
      title: <I18n id={'trade-fees-funding'} />,
      dataIndex: 'fundingFee',
      key: 'fundingFee',
      align: 'right',
      render: (fundingFee: { paid: SldDecimal }, row: ShieldOrderInfo) => {
        return (
          <div className={styleMerge(styles.flexGroup)}>
            <TokenAmountInline
              token={row.token.symbol}
              amount={fundingFee.paid}
              symClassName={styles.label}
              short={true}
            />

            <OrderFundingSchedule order={row} />
          </div>
        );
      },
    },
    {
      title: <I18n id={'trade-unrealized-pnl'} />,
      dataIndex: 'markPrice',
      key: 'positionPNLVal',
      align: 'right',
      render: (markPrice: number, row: ShieldOrderInfo) => {
        const upl = row.pnl?.unrealizedPnl || SldDecimal.ZERO;

        return (
          <TokenAmountInline
            amount={upl}
            token={row.token.symbol}
            numClassName={upl.gtZero() ? 'longStyle' : upl.isZero() ? '' : 'shortStyle'}
            symClassName={styles.label}
            short={true}
          />
        );
      },
    },
    {
      title: <I18n id={'trade-order-action'} />,
      dataIndex: '',
      key: '',
      render: (text: string, row: ShieldOrderInfo) => {
        return (
          <div className={styleMerge(styles.flexGroup)}>
            <TextBtn
              className={styles.actionBtn}
              onClick={() => {
                P.Option.Trade.OrderList.Close.Order.set(row);
                P.Option.Trade.OrderList.Close.Visible.set(true);
              }}
            >
              <I18n id={'trade-order-close'} textUpper={'uppercase'} />
            </TextBtn>

            <ShareOrder order={row} className={styles.actionBtn} />
          </div>
        );
      },
      fixed: 'right',
    },
  ];
  columnsMobile: ColumnType<ShieldOrderInfo>[] = [
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-order-id'} />} />,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (id: BigNumber) => {
        return <span className={styleMerge(styles.label)}>#{id.toString()}</span>;
      },
    },
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-column-name-pair'} />} />,
      dataIndex: 'token',
      key: 'token',
      render: (token: TokenErc20, row: ShieldOrderInfo) => {
        return (
          <PairLabel
            size={'tiny'}
            pair={{ indexUnderlying: row.indexUnderlying, quoteToken: row.token }}
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
      dataIndex: 'optionType',
      key: 'optionType',
      render: (type: ShieldOptionType, row: ShieldOrderInfo) => {
        const typeDom: ReactNode =
          type === ShieldOptionType.Call ? (
            <div className={styles.optionTypeLong}>
              <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
            </div>
          ) : (
            <div className={styles.optionTypeShort}>
              <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
            </div>
          );
        const timeDom: ReactNode = <div className={styles.openTime}>{formatDate(row.openTime, 'MM-DD HH:mm')}</div>;

        return (
          <div className={styles.cellGroup}>
            {typeDom}
            {timeDom}
          </div>
        );
      },
    },
    {
      title: (
        <TableMobileTitle
          pullRight={true}
          itemBottom={<I18n id={'trade-unrealized-pnl'} />}
          itemTop={<I18n id={'trade-open-amount'} />}
        />
      ),
      dataIndex: 'id',
      key: 'pnl',
      align: 'right',
      render: (id: BigNumber, row: ShieldOrderInfo) => {
        const upl = row.pnl?.unrealizedPnl || SldDecimal.ZERO;
        return (
          <div className={styles.cellGroupRight}>
            <TokenAmountInline
              amount={row.orderAmount}
              token={row.indexUnderlying}
              numClassName={styleMerge(styles.largeSize, styles.line1)}
              symClassName={styleMerge(styles.smallSize, styles.line1, styles.descColor)}
            />

            <TokenAmountInline
              amount={upl}
              token={row.token.symbol}
              numClassName={styleMerge(upl.gtZero() ? 'longStyle' : upl.isZero() ? '' : 'shortStyle', styles.smallSize)}
              symClassName={styleMerge(styles.smallSize, styles.line1, styles.descColor)}
            />
          </div>
        );
      },
    },
  ];

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('orders', this.mergeOrders());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeOrders(): Observable<ShieldOrderInfo[]> {
    const prices$ = combineLatest([S.Option.Oracle.BTC.watch(), S.Option.Oracle.ETH.watch()]).pipe(
      map(([btc, eth]) => {
        return {
          [IndexUnderlyingType.ETH]: eth,
          [IndexUnderlyingType.BTC]: btc,
        };
      })
    );

    const orders$: Observable<ShieldOrderInfo[]> = S.Option.Order.ActiveList.watch();

    return combineLatest([prices$, orders$]).pipe(
      map(([prices, orders]) => {
        orders.forEach(one => {
          one.markPrice = prices[one.indexUnderlying];
          one.pnl = computeOrderPnl(one);
        });

        return orders;
      }),
      switchMap((orders: ShieldOrderInfo[]) => {
        return shieldOrderService.fillOrdersFundPhaseInfo(orders);
      }),
      tap((orders: ShieldOrderInfo[]) => {
        P.Option.Trade.OrderList.ActiveList.set(orders);
      })
    );
  }

  genRowRender(row: ShieldOrderInfo): ReactNode {
    return (
      <>
        <div className={styleMerge(styles.rowRender)}>
          <VerticalItem
            label={<I18n id={'trade-index-open-price'} />}
            align={'left'}
            labelClassName={styles.label}
            valueClassName={styles.value}
            gap={'8px'}
          >
            <TokenAmountInline amount={row.openPrice} token={''} symClassName={styles.label} />
          </VerticalItem>

          <VerticalItem
            label={<I18n id={'trade-index-mark-price'} />}
            align={'right'}
            labelClassName={styles.label}
            valueClassName={styles.value}
            gap={'8px'}
          >
            <TokenAmountInline amount={row.markPrice} token={''} />
          </VerticalItem>

          <VerticalItem
            label={<I18n id={'trade-fees-trading'} />}
            align={'left'}
            labelClassName={styles.label}
            valueClassName={styles.value}
            gap={'8px'}
          >
            <TokenAmountInline
              amount={row.tradingFee}
              token={row.token.symbol}
              symClassName={styles.label}
              short={true}
            />
          </VerticalItem>

          <VerticalItem
            label={<I18n id={'trade-fees-funding'} />}
            align={'right'}
            labelClassName={styles.label}
            valueClassName={styles.value}
            gap={'8px'}
          >
            <TokenAmountInline
              amount={row.fundingFee.paid}
              token={row.token.symbol}
              symClassName={styles.label}
              short={true}
            />
          </VerticalItem>
        </div>

        <TextBtn
          className={styleMerge('highlightStyle', styles.closeBtnMobile)}
          onClick={() => {
            P.Option.Trade.OrderList.Close.Order.set(row);
            P.Option.Trade.OrderList.Close.Visible.set(true);
          }}
        >
          <I18n id={'trade-order-close'} textUpper={'uppercase'} />
        </TextBtn>
      </>
    );
  }

  render() {
    return (
      <>
        {this.state.isMobile ? (
          <TableForMobile
            datasource={this.state.orders}
            columns={this.columnsMobile}
            rowKey={(row: ShieldOrderInfo) => row.id.toString()}
            rowRender={this.genRowRender.bind(this)}
          />
        ) : (
          <TableForDesktop
            datasource={this.state.orders}
            columns={this.columns}
            rowKey={(row: ShieldOrderInfo) => row.id.toString()}
          />
        )}

        <CloseOrderConfirm />
        <SharePopup />
      </>
    );
  }
}
