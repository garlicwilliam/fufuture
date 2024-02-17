import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, styleMerge, StyleMerger } from '../../../../../../util/string';
import styles from './locked-liquidity.module.less';
import { BlockTitle } from '../../../common/block-title';
import { I18n } from '../../../../../i18n/i18n';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import {
  ShieldMakerOrderInfo,
  ShieldMakerOrderInfoRs,
  ShieldMakerPrivatePoolInfo,
  ShieldOptionType,
  ShieldUnderlyingPrice,
  ShieldUnderlyingType,
} from '../../../../../../state-manager/state-types';
import { PairLabel } from '../../../common/pair-label';
import { TableForDesktop } from '../../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import { curTimestamp, formatMinute } from '../../../../../../util/time';
import { SldDecimal, SldDecPrice } from '../../../../../../util/decimal';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { TextBtn } from '../../../../../common/buttons/text-btn';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SortDesc } from '../../../../../common/svg/sort-desc';
import { SortAsc } from '../../../../../common/svg/sort-asc';
import { computeMakerLiquidationPrice, computeMakerOrderPnl } from '../../../../utils/compute';
import { BigNumber } from 'ethers';
import { MakerAddMargin } from './add-margin';
import { SldTips } from '../../../../../common/tips/tips';
import { ReactNode } from 'react';
import { OrderPriceGraph } from './order-price-graph';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { ZERO } from '../../../../../../constant';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { TableForMobile } from '../../../../../table/table-mobile';
import { TableMobileTitle } from '../../../../../table/table-mobile-title';
import { VerticalItem } from '../../../../../common/content/vertical-item';
import { isSameAddress } from '../../../../../../util/address';
import { SldSelect, SldSelectOption } from '../../../../../common/selects/select';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { shieldOrderService } from '../../../../services/shield-order.service';
import { fontCss } from '../../../../../i18n/font-switch';
import { Visible } from '../../../../../builtin/hidden';
import { Network } from '../../../../../../constant/network';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';

type Statistic = {
  amountCall: SldDecimal;
  amountPut: SldDecimal;
  amountTotal: SldDecimal;
  positionLossCall: SldDecimal;
  positionLossPut: SldDecimal;
  positionLossTotal: SldDecimal;
  premiumCall: SldDecimal;
  premiumPut: SldDecimal;
  premiumTotal: SldDecimal;
  pnlCall: SldDecimal;
  pnlPut: SldDecimal;
  pnlTotal: SldDecimal;
  countCall: number;
  countPut: number;
  countTotal: number;
};
type IState = {
  isMobile: boolean;
  network: Network | null;
  userAddr: string | null;

  liquidityList: ShieldMakerPrivatePoolInfo[];
  curPool: ShieldMakerPrivatePoolInfo | null;

  lockedDetailRs: ShieldMakerOrderInfoRs | undefined;
  lockedDetailRsPending: boolean;

  paramPeriod: BigNumber;
  needMigrations: BigNumber[];
  statistic: Statistic | null;
};
type IProps = {};

export class TradeLockedLiquidity extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    network: null,
    userAddr: null,

    liquidityList: [],
    curPool: null,

    lockedDetailRs: undefined,
    lockedDetailRsPending: false,

    paramPeriod: ZERO,
    needMigrations: [],
    statistic: null,
  };

  columns: ColumnType<ShieldMakerOrderInfo>[] = [
    {
      title: <I18n id={'trade-order-id'} />,
      dataIndex: 'id',
      key: 'id',
      render: (id: BigNumber, row: ShieldMakerOrderInfo) => {
        return <span className={styles.label}>{'#' + id.toString()}</span>;
      },
    },
    {
      title: (
        <>
          <I18n id={'trade-type'} />/<I18n id={'trade-time'} />
        </>
      ),
      dataIndex: 'openTime',
      key: 'openTime',
      render: (time: number, row: ShieldMakerOrderInfo) => {
        return (
          <div className={styles.cellGroup}>
            <div
              className={styleMerge(
                cssPick(row.optionType === ShieldOptionType.Put, styles.cellMainShort),
                cssPick(row.optionType === ShieldOptionType.Call, styles.cellMainLong)
              )}
            >
              {row.optionType === ShieldOptionType.Call ? (
                <I18n id={'trade-option-type-sell-call'} textUpper={'uppercase'} />
              ) : (
                <I18n id={'trade-option-type-sell-put'} textUpper={'uppercase'} />
              )}
            </div>
            <div className={styles.cellDesc}>{formatMinute(time)}</div>
          </div>
        );
      },
    },
    {
      title: <I18n id={'trade-amount'} />,
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      align: 'right',
      render: (amount: SldDecimal, row: ShieldMakerOrderInfo) => {
        return <TokenAmountInline amount={amount} token={row.underlying} symClassName={styles.label} short={true} />;
      },
    },
    {
      title: (
        <>
          <I18n id={'trade-maker-margin-locked'} />
          <br />
          <span className={styleMerge()}>
            <I18n id={'trade-maker-maintenance-margin-short'} />
            &nbsp;
            <SldTips content={<I18n id={'trade-maker-maintenance-margin'} />} contentClassName={styles.tip} />
          </span>
        </>
      ),
      dataIndex: 'makerMaintenanceLocked',
      key: 'makerMaintenanceLocked',
      align: 'right',
      render: (margin: SldDecimal, row: ShieldMakerOrderInfo) => {
        return (
          <div className={styleMerge(styles.cellGroup, styles.cellRight)}>
            <TokenAmountInline
              amount={row.makerMarginAmount}
              token={row.token.symbol}
              symClassName={styles.cellDesc}
              numClassName={styles.cellMain1}
              short={true}
              className={styleMerge(styles.cellRight)}
            />

            <TokenAmountInline
              amount={row.makerMaintenanceLocked}
              token={row.token.symbol}
              symClassName={styles.cellDesc}
              numClassName={styles.cellDesc}
              short={true}
              className={styleMerge(styles.cellRight)}
            />
          </div>
        );
      },
    },
    {
      title: (
        <>
          <I18n id={'trade-index-open-price'} />
          <br />
          <I18n id={'trade-index-mark-price'} />
        </>
      ),
      dataIndex: 'openPrice',
      key: 'openPrice',
      align: 'right',
      render: (price: SldDecPrice, row: ShieldMakerOrderInfo) => {
        const isIncrease = row.markPrice?.gt(row.openPrice);
        const isDecrease = row.markPrice?.lt(row.openPrice);

        return (
          <div className={styleMerge(styles.cellGroup, styles.cellRight)}>
            <TokenAmountInline className={styleMerge(styles.cellMain1, styles.cellRight)} amount={price} token={''} />

            <div
              className={styleMerge(
                styles.line1,
                styles.priceChange,
                cssPick(isIncrease, styles.cellDescLong),
                cssPick(isDecrease, styles.cellDescShort),
                cssPick(!isIncrease && !isDecrease, styles.cellDesc)
              )}
            >
              <TokenAmountInline className={styleMerge(styles.cellRight)} amount={row.markPrice} token={''} />
              {isDecrease ? <SortDesc height={10} width={5} /> : isIncrease ? <SortAsc height={10} width={5} /> : <></>}
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <>
          <I18n id={'trade-position-loss'} /> <br />
          <I18n id={'trade-funding-fee-premium'} />
        </>
      ),
      dataIndex: 'fundingInfo',
      key: 'fundingFee',
      align: 'right',
      render: (info: { paid: SldDecimal }, row: ShieldMakerOrderInfo) => {
        const loss = row.pnl?.positionLoss || SldDecimal.ZERO;

        return (
          <div className={styleMerge(styles.cellGroup, styles.cellRight)}>
            <TokenAmountInline
              amount={loss}
              token={row.token.symbol}
              symClassName={styles.cellDesc}
              numClassName={loss.gtZero() ? styles.cellMainShort : ''}
              short={true}
              className={styles.cellRight}
            />

            <TokenAmountInline
              amount={info.paid}
              token={row.token.symbol}
              symClassName={styles.cellDesc}
              numClassName={styles.cellDescLong}
              short={true}
              className={styles.cellRight}
            />
          </div>
        );
      },
    },
    {
      title: <I18n id={'trade-pnl'} />,
      dataIndex: 'fundingInfo',
      key: 'pnl',
      align: 'right',
      render: (info, row: ShieldMakerOrderInfo) => {
        const pnl = row.pnl?.pnl || SldDecimal.ZERO;

        return (
          <TokenAmountInline
            amount={pnl}
            numClassName={pnl.gtZero() ? styles.long : pnl.ltZero() ? styles.short : ''}
            symClassName={styles.label}
            token={row.token.symbol}
            short={true}
          />
        );
      },
    },
    {
      title: <I18n id={'trade-order-action'} />,
      dataIndex: 'id',
      key: 'action',
      align: 'right',
      render: (id, row: ShieldMakerOrderInfo) => {
        return (
          <TextBtn
            stopPropagation={true}
            className={styleMerge(styles.actionBtn)}
            onClick={() => this.onAddMargin(row)}
          >
            <I18n id={'trade-add-margin'} textUpper={'uppercase'} />
          </TextBtn>
        );
      },
    },
  ];
  columnsMobile: ColumnType<ShieldMakerOrderInfo>[] = [
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-order-id'} />} />,
      dataIndex: 'id',
      key: 'id',
      render: (id: BigNumber, row: ShieldMakerOrderInfo) => {
        return <span className={styles.label}>{'#' + id.toString()}</span>;
      },
    },
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-type'} />} itemBottom={<I18n id={'trade-time'} />} />,
      dataIndex: 'openTime',
      key: 'time',
      render: (time: number, row: ShieldMakerOrderInfo) => {
        return (
          <div className={styles.cellGroup}>
            <div
              className={styleMerge(
                cssPick(row.optionType === ShieldOptionType.Put, styles.cellMainShort),
                cssPick(row.optionType === ShieldOptionType.Call, styles.cellMainLong)
              )}
            >
              {row.optionType === ShieldOptionType.Call ? (
                <I18n id={'trade-option-type-sell-call'} textUpper={'uppercase'} />
              ) : (
                <I18n id={'trade-option-type-sell-put'} textUpper={'uppercase'} />
              )}
            </div>
            <div className={styles.cellDesc}>{formatMinute(time)}</div>
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
      key: 'amount',
      align: 'right',
      render: (amount: SldDecimal, row: ShieldMakerOrderInfo) => {
        return (
          <div className={styles.cellGroup}>
            <div className={styleMerge(styles.cellDesc)}>
              <TokenAmountInline
                amount={amount}
                token={row.underlying}
                numClassName={styles.cellMain}
                symClassName={styles.cellDesc}
              />
            </div>
            <div className={styleMerge(styles.cellDesc)}>
              <TokenAmountInline
                amount={row.pnl?.pnl}
                token={row.token.symbol}
                numClassName={styles.cellDescLong}
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
    this.registerObservable('network', walletState.NETWORK);
    this.registerObservable('userAddr', walletState.USER_ADDR);
    this.registerObservable('liquidityList', this.mergePoolList());
    this.registerState('curPool', P.Option.Pools.Private.LockedDetails.CurPool);
    this.registerObservable('lockedDetailRs', this.mergeLockedDetails());
    this.registerStatePending('lockedDetailRsPending', D.Option.Maker.LockedDetails);

    this.registerState('paramPeriod', S.Option.Params.Funding.Period);
    this.registerObservable('needMigrations', this.mergeNeedMigrations());
    this.registerObservable('statistic', this.mergeStatistic());

    this.sub(this.initSelectPool());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeNeedMigrations(): Observable<BigNumber[]> {
    const now = curTimestamp();

    return this.watchStateChange('lockedDetailRs').pipe(
      filter(Boolean),
      map((detailRs: ShieldMakerOrderInfoRs) => {
        return detailRs.orders.filter(one => one.fundingInfo.scheduleMigration < now);
      }),
      map((details: ShieldMakerOrderInfo[]) => {
        return details.map(one => one.id);
      })
    );
  }

  emptyStatistic(): Statistic {
    return {
      amountCall: SldDecimal.ZERO,
      amountPut: SldDecimal.ZERO,
      amountTotal: SldDecimal.ZERO,
      positionLossCall: SldDecimal.ZERO,
      positionLossPut: SldDecimal.ZERO,
      positionLossTotal: SldDecimal.ZERO,
      premiumCall: SldDecimal.ZERO,
      premiumPut: SldDecimal.ZERO,
      premiumTotal: SldDecimal.ZERO,
      pnlCall: SldDecimal.ZERO,
      pnlPut: SldDecimal.ZERO,
      pnlTotal: SldDecimal.ZERO,
      countCall: 0,
      countPut: 0,
      countTotal: 0,
    };
  }

  mergeStatistic(): Observable<Statistic> {
    return combineLatest([
      this.watchStateChange('lockedDetailRs'),
      this.watchStateChange('curPool'),
      this.watchStateChange('userAddr'),
      this.watchStateChange('network'),
    ]).pipe(
      map(([detailRs, curPool, userAddr, network]) => {
        const statistic = this.emptyStatistic();

        if (!detailRs || this.datasourceNotMatch()) {
          return statistic;
        }

        detailRs.orders.forEach((detail: ShieldMakerOrderInfo) => {
          if (detail.optionType === ShieldOptionType.Call) {
            statistic.amountCall = statistic.amountCall.add(detail.orderAmount);
            statistic.positionLossCall = statistic.positionLossCall.add(detail.pnl?.positionLoss || SldDecimal.ZERO);
            statistic.pnlCall = statistic.pnlCall.add(detail.pnl?.pnl || SldDecimal.ZERO);
            statistic.premiumCall = statistic.premiumCall.add(detail.pnl?.premium || SldDecimal.ZERO);
            statistic.countCall = statistic.countCall + 1;
          } else {
            statistic.amountPut = statistic.amountPut.add(detail.orderAmount);
            statistic.positionLossPut = statistic.positionLossPut.add(detail.pnl?.positionLoss || SldDecimal.ZERO);
            statistic.pnlPut = statistic.pnlPut.add(detail.pnl?.pnl || SldDecimal.ZERO);
            statistic.premiumPut = statistic.premiumPut.add(detail.pnl?.premium || SldDecimal.ZERO);
            statistic.countPut = statistic.countPut + 1;
          }
        });

        statistic.amountTotal = statistic.amountCall.add(statistic.amountPut);
        statistic.positionLossTotal = statistic.positionLossCall.add(statistic.positionLossPut);
        statistic.pnlTotal = statistic.pnlCall.add(statistic.pnlPut);
        statistic.premiumTotal = statistic.premiumCall.add(statistic.premiumPut);
        statistic.countTotal = statistic.countCall + statistic.countPut;

        return statistic;
      })
    );
  }

  mergePoolList(): Observable<ShieldMakerPrivatePoolInfo[]> {
    return D.Option.Maker.YourLiquidity.watch().pipe(
      map(poolsRs => {
        return poolsRs.pools.sort((a, b) => {
          const idA = a.indexUnderlying + a.token.symbol;
          const idB = b.indexUnderlying + b.token.symbol;

          return idA > idB ? 1 : -1;
        });
      })
    );
  }

  initSelectPool(): Observable<any> {
    return combineLatest([this.watchStateChange('liquidityList'), this.watchStateChange('curPool')]).pipe(
      filter(([list, cur]: [ShieldMakerPrivatePoolInfo[], ShieldMakerPrivatePoolInfo | null]) => {
        const exist: boolean =
          list.length > 0 && !!cur && list.some(one => isSameAddress(one.priPoolAddress, cur.priPoolAddress));

        return !exist;
      }),
      tap(([list, cur]) => {
        if (list.length === 0) {
          if (P.Option.Pools.Private.LockedDetails.CurPool.get() !== null)
            P.Option.Pools.Private.LockedDetails.CurPool.set(null);
        } else {
          P.Option.Pools.Private.LockedDetails.CurPool.set(list[0]);
        }
      })
    );
  }

  onAddMargin(order: ShieldMakerOrderInfo) {
    P.Option.Pools.Private.LockedDetails.AddMargin.CurOrder.set(order);
    P.Option.Pools.Private.LockedDetails.AddMargin.IsVisible.set(true);
  }

  onSelect(pool: ShieldMakerPrivatePoolInfo) {
    P.Option.Pools.Private.LockedDetails.CurPool.set(pool);
  }

  refreshAll() {
    D.Option.Maker.LockedDetails.tick();
  }

  refreshOne(order: ShieldMakerOrderInfo) {
    if (!this.state.curPool) {
      return;
    }

    const refresh$ = shieldOrderService.getMakerPriPoolOrder(this.state.curPool, order.indexInPool).pipe(
      switchMap((order: ShieldMakerOrderInfo) => {
        return this.fillPnl([order], order.underlying);
      }),
      tap((orders: ShieldMakerOrderInfo[]) => {
        if (!this.state.lockedDetailRs) {
          return;
        }

        const newOrder: ShieldMakerOrderInfo = orders[0];
        const newOrders: ShieldMakerOrderInfo[] = this.state.lockedDetailRs.orders.map(one => {
          return one.id.eq(newOrder.id) ? newOrder : one;
        });

        this.updateState({ lockedDetailRs: Object.assign({}, this.state.lockedDetailRs, { orders: newOrders }) });
      })
    );

    this.subOnce(refresh$);
  }

  private mergeLockedDetails(): Observable<ShieldMakerOrderInfoRs | undefined> {
    return D.Option.Maker.LockedDetails.watch().pipe(
      switchMap((detailRs: ShieldMakerOrderInfoRs | undefined) => {
        if (!detailRs) {
          return of(undefined);
        }

        const orders = detailRs.orders;

        if (orders.length === 0) {
          return of(detailRs);
        }

        const assets: ShieldUnderlyingType = orders[0].underlying;

        return this.fillPnl(orders, assets).pipe(
          map((orders: ShieldMakerOrderInfo[]) => {
            return Object.assign(detailRs, { orders });
          })
        );
      })
    );
  }

  private fillPnl(
    orders: ShieldMakerOrderInfo[],
    indexUnderlying: ShieldUnderlyingType
  ): Observable<ShieldMakerOrderInfo[]> {
    const price$: Observable<SldDecPrice> = S.Option.Oracle[indexUnderlying]
      .watch()
      .pipe(map(underlyingPrice => underlyingPrice.price));

    return price$.pipe(
      map((price: SldDecPrice) => {
        return orders.map((order: ShieldMakerOrderInfo) => {
          order.markPrice = price;
          order.pnl = computeMakerOrderPnl(order);

          const { liqPrice, couldLiq } = computeMakerLiquidationPrice(order);
          order.liquidationPrice = liqPrice;
          order.couldLiquidation = couldLiq;

          return order;
        });
      })
    );
  }

  deskRowRender(row: ShieldMakerOrderInfo): ReactNode {
    const needMigration: boolean = curTimestamp() > row.fundingInfo.scheduleMigration;

    return (
      <div className={styleMerge(styles.deskTableExt)}>
        <OrderPriceGraph order={row} className={styles.graph} />

        <div className={styleMerge(styles.migrate)}>
          <HorizonItem
            label={<I18n id={'trade-funding-fee-settlement-last'} />}
            align={'justify'}
            labelClass={styleMerge(styles.label)}
            valueClass={styleMerge(styles.value)}
          >
            <I18n
              id={'trade-hours-ago'}
              params={{ num: Math.floor((curTimestamp() - row.fundingInfo.lastMigration) / 3600) }}
            />
          </HorizonItem>

          <SldButton
            size={'tiny'}
            type={needMigration ? 'primary' : 'default'}
            disabled={!needMigration}
            className={styleMerge(
              cssPick(needMigration, styles.btnOutline),
              cssPick(!needMigration, styles.btnDefault)
            )}
            onClick={() => this.onMigrateOne(row)}
          >
            <I18n id={'trade-funding-fee-settlement'} textUpper={'uppercase'} />
          </SldButton>

          <Visible when={row.couldLiquidation || false}>
            <SldButton
              size={'tiny'}
              type={'primary'}
              className={styleMerge(styles.btnOutline)}
              onClick={() => this.onRiskControlOne(row)}
            >
              <I18n id={'trade-liquidation'} textUpper={'uppercase'} />
            </SldButton>
          </Visible>
        </div>
      </div>
    );
  }

  mobileRowRender(row: ShieldMakerOrderInfo): ReactNode {
    const gap = '10px';
    const needSettlement = row.fundingInfo.scheduleMigration < curTimestamp();

    return (
      <div className={styleMerge(styles.mobTableExt)}>
        <div className={styleMerge(styles.content)}>
          <VerticalItem
            align={'left'}
            gap={gap}
            label={<I18n id={'trade-maker-maintenance-margin'} />}
            labelClassName={styles.extLabel}
          >
            <TokenAmountInline
              amount={row.makerMaintenanceLocked}
              token={row.token.symbol}
              numClassName={styles.extValue}
              symClassName={styles.label}
            />
          </VerticalItem>

          <VerticalItem
            align={'right'}
            gap={gap}
            labelClassName={styles.extLabel}
            label={<I18n id={'trade-maker-margin-locked'} />}
          >
            <TokenAmountInline
              amount={row.makerMarginAmount}
              token={row.token.symbol}
              numClassName={styles.extValue}
              symClassName={styles.label}
            />
          </VerticalItem>

          <VerticalItem
            align={'left'}
            gap={gap}
            label={<I18n id={'trade-index-open-price'} />}
            labelClassName={styles.extLabel}
          >
            <TokenAmountInline amount={row.openPrice} token={''} numClassName={styles.extValue} />
          </VerticalItem>

          <VerticalItem
            align={'right'}
            gap={gap}
            label={<I18n id={'trade-index-mark-price'} />}
            labelClassName={styles.extLabel}
          >
            <div
              className={styleMerge(
                styles.flexValue,
                row.markPrice?.gt(row.openPrice)
                  ? styles.extLong
                  : row.markPrice?.lt(row.openPrice)
                  ? styles.extShort
                  : styles.extValue
              )}
            >
              <TokenAmountInline
                amount={row.markPrice}
                token={''}
                numClassName={
                  row.markPrice?.gt(row.openPrice)
                    ? styles.extLong
                    : row.markPrice?.lt(row.openPrice)
                    ? styles.extShort
                    : styles.extValue
                }
              />
              {row.markPrice?.gt(row.openPrice) ? <SortAsc /> : row.markPrice?.lt(row.openPrice) ? <SortDesc /> : <></>}
            </div>
          </VerticalItem>

          <VerticalItem
            label={<I18n id={'trade-position-loss'} />}
            align={'left'}
            gap={gap}
            labelClassName={styles.extLabel}
          >
            <TokenAmountInline
              amount={row.pnl?.positionLoss}
              token={row.token.symbol}
              numClassName={row.pnl?.positionLoss.gtZero() ? styles.extShort : styles.extValue}
              symClassName={styles.label}
            />
          </VerticalItem>

          <VerticalItem
            label={<I18n id={'trade-funding-fee-premium'} />}
            align={'right'}
            gap={gap}
            labelClassName={styles.extLabel}
          >
            <TokenAmountInline
              amount={row.pnl?.premium}
              token={row.token.symbol}
              numClassName={row.pnl?.premium.gtZero() ? styles.extLong : styles.extValue}
              symClassName={styles.label}
            />
          </VerticalItem>
        </div>

        <div className={styleMerge(styles.actions)}>
          <div className={styleMerge(styles.actionBox)}>
            <HorizonItem
              label={<I18n id={'trade-liquidation-price'} />}
              align={'justify'}
              labelClass={styleMerge(styles.label)}
            >
              <TokenAmountInline amount={row.liquidationPrice} token={''} numClassName={styles.extValue} />
            </HorizonItem>

            <SldButton size={'tiny'} type={'none'} className={styles.btn} onClick={() => this.onAddMargin(row)}>
              <I18n id={'trade-add-margin'} textUpper={'uppercase'} />
            </SldButton>
          </div>
          <div className={styleMerge(styles.actionBox)}>
            <HorizonItem
              label={<I18n id={'trade-funding-fee-settlement-last'} />}
              align={'justify'}
              labelClass={styleMerge(styles.label)}
              valueClass={styles.extValue}
            >
              <I18n
                id={'trade-hours-ago'}
                params={{ num: Math.floor((curTimestamp() - row.fundingInfo.lastMigration) / 3600) }}
              />
            </HorizonItem>

            <SldButton
              size={'tiny'}
              type={'default'}
              disabled={!needSettlement}
              className={styleMerge(styles.btnDefault, styles.actBtn)}
              onClick={() => this.onMigrateOne(row)}
            >
              <I18n id={'trade-funding-fee-settlement'} textUpper={'uppercase'} />
            </SldButton>
          </div>
        </div>
      </div>
    );
  }

  onMigrateOne(order: ShieldMakerOrderInfo) {
    const migrate$ = shieldOptionTradeService.migration([order.id]);

    this.subOnce(migrate$, done => {
      if (done) {
        this.refreshOne(order);
      }
    });
  }

  onMigrate(orderIds: BigNumber[]) {
    const migrate$ = shieldOptionTradeService.migration(orderIds);

    this.subOnce(migrate$, done => {
      if (done) {
        this.refreshAll();
      }
    });
  }

  onRiskControlOne(order: ShieldMakerOrderInfo) {
    const riskControl$ = shieldOptionTradeService.riskControl([order.id]);

    this.subOnce(riskControl$, done => {
      if (done) {
        this.refreshAll();
      }
    });
  }

  genSelectOption(): SldSelectOption[] {
    return this.state.liquidityList.map(one => {
      return {
        value: one.priPoolAddress,
        label: (
          <PairLabel
            hideIcon={false}
            key={one.priPoolAddress}
            size={this.state.isMobile ? 'tiny' : 'small'}
            pair={{ indexUnderlying: one.indexUnderlying, quoteToken: one.token }}
          />
        ),
        object: one,
      };
    });
  }

  selectValueCss(value: SldDecimal | undefined, positive?: boolean) {
    if (positive) {
      return value?.gtZero() ? styles.shortValue : value?.isZero() ? styles.label : styles.longValue;
    } else {
      return value?.gtZero() ? styles.longValue : value?.isZero() ? styles.label : styles.shortValue;
    }
  }

  selectValueCssM(value: SldDecimal | undefined, positive?: boolean) {
    if (positive) {
      return value?.gtZero() ? styles.shortValueMob : value?.isZero() ? styles.sym : styles.longValueMob;
    } else {
      return value?.gtZero() ? styles.longValueMob : value?.isZero() ? styles.sym : styles.shortValueMob;
    }
  }

  private genStatisticNode(styleMr: StyleMerger): ReactNode {
    return (
      <div className={styleMr(styles.gridItems)}>
        <div className={styleMr(styles.first, styles.title)}>
          <I18n id={'trade-option-type'} />
        </div>
        <div className={styleMr(styles.title)}>
          <I18n id={'trade-amount-position-total'} />
        </div>
        <div className={styleMr(styles.title)}>
          <I18n id={'trade-position-loss'} />
        </div>
        <div className={styleMr(styles.title)}>
          <I18n id={'trade-funding-fee-premium'} />
        </div>
        <div className={styleMr(styles.title)}>
          <I18n id={'trade-pnl'} />
        </div>

        {/* -- */}

        <div className={styleMr(styles.first, styles.longValue)}>
          <I18n id={'trade-option-type-sell-call'} textUpper={'uppercase'} />
          &nbsp;({this.state.statistic?.countCall})
        </div>
        <TokenAmountInline
          amount={this.state.statistic?.amountCall}
          token={this.state.curPool?.indexUnderlying || ''}
          numClassName={styleMr(styles.value)}
          symClassName={styleMr(styles.sym)}
        />
        <TokenAmountInline
          amount={this.state.statistic?.positionLossCall}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.positionLossCall, true))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.premiumCall}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.premiumCall))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.pnlCall}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.pnlCall))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />

        {/* --- */}

        <div className={styleMr(styles.first, styles.shortValue)}>
          <I18n id={'trade-option-type-sell-put'} textUpper={'uppercase'} />
          &nbsp;({this.state.statistic?.countPut})
        </div>
        <TokenAmountInline
          amount={this.state.statistic?.amountPut}
          token={this.state.curPool?.indexUnderlying || ''}
          numClassName={styleMr(styles.value)}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.positionLossPut}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.positionLossPut, true))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.premiumPut}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.premiumPut))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.pnlPut}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.pnlPut))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />

        {/* -- */}

        <div className={styleMr(styles.first, styles.value)}>
          <I18n id={'trade-sum-total'} />
          &nbsp;({this.state.statistic?.countTotal})
        </div>
        <TokenAmountInline
          amount={this.state.statistic?.amountTotal}
          token={this.state.curPool?.indexUnderlying || ''}
          numClassName={styleMr(styles.value)}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.positionLossTotal}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.positionLossTotal, true))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.premiumTotal}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.premiumTotal))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
        <TokenAmountInline
          amount={this.state.statistic?.pnlTotal}
          token={this.state.curPool?.token.symbol || ''}
          numClassName={styleMr(this.selectValueCss(this.state.statistic?.pnlTotal))}
          symClassName={styleMr(styles.sym)}
          short={true}
        />
      </div>
    );
  }

  private genStatisticNodeMob(styleMr: StyleMerger): ReactNode {
    return (
      <div className={styleMr(styles.gridItemsMob)}>
        <HorizonItem
          label={<I18n id={'trade-amount-position-total'} />}
          align={'justify'}
          className={styleMr(styles.sym)}
        >
          <TokenAmountInline
            amount={this.state.statistic?.amountTotal}
            token={this.state.curPool?.indexUnderlying || ''}
            numClassName={styleMr(styles.valueMob)}
            symClassName={styleMr(styles.sym)}
            short={true}
          />
        </HorizonItem>
        <HorizonItem label={<I18n id={'trade-position-loss'} />} align={'justify'} className={styleMr(styles.sym)}>
          <TokenAmountInline
            amount={this.state.statistic?.positionLossTotal}
            token={this.state.curPool?.token.symbol || ''}
            numClassName={styleMr(this.selectValueCssM(this.state.statistic?.positionLossTotal, true))}
            short={true}
          />
        </HorizonItem>
        <HorizonItem
          label={<I18n id={'trade-funding-fee-premium'} />}
          align={'justify'}
          className={styleMr(styles.sym)}
        >
          <TokenAmountInline
            amount={this.state.statistic?.premiumTotal}
            token={this.state.curPool?.token.symbol || ''}
            numClassName={styleMr(this.selectValueCssM(this.state.statistic?.premiumTotal))}
            short={true}
          />
        </HorizonItem>

        <HorizonItem label={<I18n id={'trade-pnl'} />} align={'justify'} className={styleMr(styles.sym)}>
          <TokenAmountInline
            amount={this.state.statistic?.pnlTotal}
            token={this.state.curPool?.token.symbol || ''}
            numClassName={styleMr(this.selectValueCssM(this.state.statistic?.pnlTotal))}
            short={true}
          />
        </HorizonItem>
      </div>
    );
  }

  private getDataSource(): ShieldMakerOrderInfo[] | undefined {
    if (this.state.curPool === null) {
      return [];
    }

    return this.datasourceNotMatch() ? undefined : this.state.lockedDetailRs?.orders;
  }

  private datasourceNotMatch() {
    const isMakerMatch: boolean =
      !!this.state.lockedDetailRs &&
      !!this.state.userAddr &&
      isSameAddress(this.state.lockedDetailRs.maker, this.state.userAddr);

    const isNetworkMatch: boolean =
      !!this.state.lockedDetailRs && this.state.lockedDetailRs.network === this.state.network;

    const isPoolMatch: boolean =
      !!this.state.lockedDetailRs &&
      !!this.state.curPool &&
      isSameAddress(this.state.lockedDetailRs?.pool, this.state.curPool.priPoolAddress);

    return !isNetworkMatch || !isMakerMatch || !isPoolMatch;
  }

  render(): JSX.Element {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const datasource = this.getDataSource();

    return (
      <>
        <div className={styleMr(styles.wrapperLocked)}>
          <BlockTitle title={<I18n id={'trade-liquidity-locked-detail'} />} />

          <div className={styleMr(styles.detailCard)}>
            <div className={styleMr(styles.poolMenus)}>
              <SldSelect
                parentClassName={styleMr(styles.selectPool)}
                dropdownClassName={styleMr(styles.selectPoolDropdown)}
                noBorder={true}
                options={this.genSelectOption()}
                curSelected={this.state.curPool?.priPoolAddress}
                onChangeSelect={op => this.onSelect(op.object)}
              />

              <div className={styleMr(styles.batchActions)}>
                <SldButton
                  size={'small'}
                  type={'primaryNoBg'}
                  disabled={this.state.needMigrations.length === 0}
                  className={styleMr(styles.btnOutline)}
                  onClick={() => this.onMigrate(this.state.needMigrations)}
                >
                  <I18n
                    id={'trade-funding-fee-settlement'}
                    textUpper={'capitalize'}
                    appendStr={` (${this.state.needMigrations.length})`}
                  />
                </SldButton>
              </div>
            </div>

            <div className={styleMr(styles.poolStatistics)}>
              <div className={styleMr(styles.sTitle, fontCss.bold)}>
                <I18n id={'trade-statistic'} />
              </div>

              {this.state.isMobile ? this.genStatisticNodeMob(styleMr) : this.genStatisticNode(styleMr)}
            </div>

            <div className={styleMr(styles.poolDetails)}>
              {this.state.isMobile ? (
                <TableForMobile
                  rowKey={(row: ShieldMakerOrderInfo) => row.id.toString()}
                  datasource={datasource}
                  columns={this.columnsMobile}
                  rowRender={this.mobileRowRender.bind(this)}
                  loading={this.state.lockedDetailRsPending}
                  pagination={{ pageSize: 5 }}
                />
              ) : (
                <TableForDesktop
                  rowKey={(row: ShieldMakerOrderInfo) => row.id.toString()}
                  datasource={datasource}
                  columns={this.columns}
                  loading={this.state.lockedDetailRsPending}
                  rowRender={this.deskRowRender.bind(this)}
                  pagination={{ pageSize: 10 }}
                />
              )}
            </div>
          </div>
        </div>

        <MakerAddMargin onDone={(order: ShieldMakerOrderInfo) => this.refreshOne(order)} />
      </>
    );
  }
}
