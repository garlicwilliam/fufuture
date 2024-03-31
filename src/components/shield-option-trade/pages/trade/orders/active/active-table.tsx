import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { TableForDesktop } from '../../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import {
  ShieldOrderInfoRs,
  ShieldOptionType,
  ShieldOrderInfo,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../../../../state-manager/state-types';
import { I18n } from '../../../../../i18n/i18n';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { formatDate } from '../../../../../../util/time';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { SldDecimal, SldDecPrice } from '../../../../../../util/decimal';
import { map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { computeOrderPnl } from '../../../../utils/compute';
import { styleMerge } from '../../../../../../util/string';
import { TextBtn } from '../../../../../common/buttons/text-btn';
import { CloseOrderConfirm } from './close-confirm';
import { PairLabel } from '../../../common/pair-label';
import { ReactNode } from 'react';
import styles from './active-table.module.less';
import { shieldOrderService } from '../../../../services/shield-order.service';
import { TableMobileTitle } from '../../../../../table/table-mobile-title';
import { TableForMobile } from '../../../../../table/table-mobile';
import { BigNumber } from 'ethers';
import { VerticalItem } from '../../../../../common/content/vertical-item';
import { OrderFundingSchedule } from './funding-schedule';
import { ShareOrder } from '../../../share/share';
import { SharePopup } from '../../../share/share-popup';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { Network } from '../../../../../../constant/network';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { isSameAddress } from '../../../../../../util/address';
import { SLD_ENV_CONF } from '../../../../const/env';

type IState = {
  isMobile: boolean;
  ordersRs: ShieldOrderInfoRs | undefined;
  network: Network | null;
  userAddr: string | null;
};
type IProps = {};

export class ActiveOrderTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    ordersRs: undefined,
    network: null,
    userAddr: null,
  };

  private columns: ColumnType<ShieldOrderInfo>[] = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      render: (id: BigNumber, row: ShieldOrderInfo) => {
        return <span className={styleMerge(styles.label)}>{id.toString()}</span>;
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
        <TokenAmountInline
          token={row.indexUnderlying}
          amount={amount}
          symClassName={styles.label}
          fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
          rmZero={true}
        />
      ),
    },
    {
      title: <I18n id={'trade-fees-trading'} />,
      dataIndex: 'tradingFee',
      key: 'tradingFee',
      align: 'right',
      render: (tradingFee: SldDecimal, row: ShieldOrderInfo) => (
        <TokenAmountInline
          amount={tradingFee}
          token={row.token.symbol}
          symClassName={styles.label}
          short={true}
          rmZero={true}
          fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
          precision={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
        />
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
      render: (price: SldDecPrice, row: ShieldOrderInfo) => {
        return <TokenAmountInline amount={price} token={''} />;
      },
    },
    {
      title: <I18n id={'trade-funding-fee-paid'} />,
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
              rmZero={true}
              fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
              precision={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
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
            sign={true}
            rmZero={true}
            fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
            precision={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
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
  private columnsMobile: ColumnType<ShieldOrderInfo>[] = [
    {
      title: <TableMobileTitle pullRight={false} itemTop={'#'} />,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      className: styles.idColMobile,
      render: (id: BigNumber) => {
        return <span className={styleMerge(styles.label, styles.smallSize)}>{id.toString()}</span>;
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
        const pnl: SldDecimal = row.pnl?.unrealizedPnl || SldDecimal.ZERO;

        return (
          <div className={styles.cellGroupRight}>
            <TokenAmountInline
              amount={row.orderAmount}
              token={row.indexUnderlying}
              numClassName={styleMerge(styles.largeSize, styles.line1)}
              symClassName={styleMerge(styles.smallSize, styles.line1, styles.descColor)}
              fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
              rmZero={true}
            />

            <TokenAmountInline
              amount={pnl}
              token={row.token.symbol}
              numClassName={styleMerge(pnl.gtZero() ? 'longStyle' : pnl.isZero() ? '' : 'shortStyle', styles.smallSize)}
              symClassName={styleMerge(styles.smallSize, styles.line1, styles.descColor)}
              short={true}
              sign={true}
              rmZero={true}
              fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
              precision={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
            />
          </div>
        );
      },
    },
  ];

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('ordersRs', this.mergeOrders());
    this.registerObservable('network', walletState.NETWORK);
    this.registerObservable('userAddr', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  private mergeOrders(): Observable<ShieldOrderInfoRs> {
    const prices$ = combineLatest([S.Option.Oracle.BTC.watch(), S.Option.Oracle.ETH.watch()]).pipe(
      map(([btc, eth]) => {
        return {
          [ShieldUnderlyingType.ETH]: eth.price,
          [ShieldUnderlyingType.BTC]: btc.price,
        };
      })
    );

    const ordersRs$: Observable<ShieldOrderInfoRs> = S.Option.Order.ActiveList.watch().pipe(
      switchMap((ordersRs: ShieldOrderInfoRs) => {
        return shieldOrderService.fillOrdersFundPhaseInfo(ordersRs);
      })
    );

    return combineLatest([prices$, ordersRs$]).pipe(
      map(([prices, ordersRs]) => {
        ordersRs.orders = ordersRs.orders.map(one => ({ ...one }));
        ordersRs.orders.forEach(one => {
          one.markPrice = prices[one.indexUnderlying];
          one.pnl = computeOrderPnl(one);
        });

        return ordersRs;
      }),
      tap((ordersRs: ShieldOrderInfoRs) => {
        P.Option.Trade.OrderList.ActiveList.set(ordersRs.orders);
      })
    );
  }

  private genRowRender(row: ShieldOrderInfo): ReactNode {
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
              rmZero={true}
              fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
              precision={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
            />
          </VerticalItem>

          <VerticalItem
            label={<I18n id={'trade-funding-fee-paid'} />}
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
              rmZero={true}
              fix={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
              precision={SLD_ENV_CONF.FixDigits.Open[row.indexUnderlying]}
            />
          </VerticalItem>

          <SldButton
            size={'tiny'}
            type={'none'}
            className={styles.btnOutline}
            onClick={() => {
              P.Option.Trade.OrderList.Close.Order.set(row);
              P.Option.Trade.OrderList.Close.Visible.set(true);
            }}
          >
            <I18n id={'trade-order-close'} textUpper={'uppercase'} />
          </SldButton>

          <ShareOrder order={row} isText={false} />
        </div>
      </>
    );
  }

  private getDataSource(): ShieldOrderInfo[] | undefined {
    const isLoading =
      this.state.ordersRs === undefined ||
      (this.state.userAddr && !isSameAddress(this.state.userAddr, this.state.ordersRs.taker)) ||
      this.state.ordersRs.network !== this.state.network;

    return isLoading ? undefined : this.state.ordersRs?.orders;
  }

  render() {
    const datasource: ShieldOrderInfo[] | undefined = this.getDataSource();

    return (
      <>
        {this.state.isMobile ? (
          <TableForMobile
            datasource={datasource}
            columns={this.columnsMobile}
            rowKey={(row: ShieldOrderInfo) => row.id.toString()}
            rowRender={this.genRowRender.bind(this)}
          />
        ) : (
          <TableForDesktop
            datasource={datasource}
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
