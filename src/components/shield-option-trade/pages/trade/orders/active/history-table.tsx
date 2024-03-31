import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { cssPick, styleMerge } from '../../../../../../util/string';
import styles from './history-table.module.less';
import {
  ShieldClosedOrderInfo,
  ShieldClosedOrderInfoRs,
  ShieldOptionType,
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
import { TableMobileTitle } from '../../../../../table/table-mobile-title';
import { BigNumber } from 'ethers';
import { TableForMobile } from '../../../../../table/table-mobile';
import { VerticalItem } from '../../../../../common/content/vertical-item';
import { OrderStatusNode } from '../../../../const/status';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { isSameAddress } from '../../../../../../util/address';
import { Network } from '../../../../../../constant/network';
import { SLD_ENV_CONF } from '../../../../const/env';

type IState = {
  isMobile: boolean;
  curUserAddress: string;
  ordersRs: ShieldClosedOrderInfoRs | undefined;
  ordersRsPending: boolean;

  network: Network | null;
};
type IProps = {};

export class HistoryOrderTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curUserAddress: '',
    ordersRs: undefined,
    ordersRsPending: false,
    network: null,
  };

  private columns: ColumnType<ShieldClosedOrderInfo>[] = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (id, row: ShieldClosedOrderInfo) => {
        return <span className={styleMerge(styles.label)}>{id.toString()}</span>;
      },
    },
    {
      title: <I18n id={'trade-column-name-pair'} />,
      dataIndex: 'id',
      key: 'pair',
      align: 'left',
      render: (id, row: ShieldClosedOrderInfo) => {
        return (
          <>
            <PairLabel
              pair={{ indexUnderlying: row.underlying, quoteToken: row.token }}
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
      title: <I18n id={'trade-option-type'} />,
      dataIndex: 'optionType',
      key: 'optionType',
      render: (type: ShieldOptionType, row: ShieldClosedOrderInfo) => {
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
      title: <I18n id={'trade-order-open-close-time'} />,
      dataIndex: 'closeTime',
      key: 'closeTime',
      render: (timestamp: number, row: ShieldClosedOrderInfo) => {
        return <>{formatMinute(row.openTime) + ' / ' + formatMinute(row.closeTime)}</>;
      },
    },
    {
      title: <I18n id={'trade-amount'} />,
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      align: 'right',
      render: (amount: SldDecimal, row: ShieldClosedOrderInfo) => {
        return (
          <TokenAmountInline
            amount={amount}
            token={row.underlying}
            symClassName={styleMerge(styles.label)}
            rmZero={true}
            fix={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
          />
        );
      },
    },
    {
      title: <I18n id={'trade-index-open-close-price'} />,
      dataIndex: 'openPrice',
      key: 'openPrice',
      align: 'right',
      render: (openPrice: SldDecPrice, row: ShieldClosedOrderInfo) => {
        return openPrice.format() + ' / ' + row.closePrice.format();
      },
    },
    {
      title: <I18n id={'trade-funding-fee-paid'} />,
      dataIndex: 'fundingFeePaid',
      key: 'fundingFeePaid',
      align: 'right',
      render: (fundingFee: SldDecimal, row: ShieldClosedOrderInfo) => {
        return (
          <TokenAmountInline
            amount={fundingFee}
            token={row.token.symbol}
            rmZero={true}
            fix={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
            precision={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
            symClassName={styles.label}
          />
        );
      },
    },
    {
      title: <I18n id={'trade-pnl'} />,
      dataIndex: 'pnl',
      key: 'pnl',
      align: 'right',
      render: (pnl, row: ShieldClosedOrderInfo) => {
        return (
          <TokenAmountInline
            amount={pnl}
            token={row.token.symbol}
            numClassName={pnl.gtZero() ? 'longStyle' : pnl.lt(SldDecimal.ZERO) ? 'shortStyle' : undefined}
            symClassName={styles.label}
            short={true}
            sign={true}
            rmZero={true}
            fix={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
            precision={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
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

  private columnsMobile: ColumnType<ShieldClosedOrderInfo>[] = [
    {
      title: <TableMobileTitle itemTop={'#'} />,
      dataIndex: 'id',
      key: 'id',
      className: styles.idColMobile,
      render: (id: BigNumber) => {
        return <span className={styleMerge(styles.cellDesc)}>{id.toString()}</span>;
      },
    },
    {
      title: <TableMobileTitle itemTop={<I18n id={'trade-column-name-pair'} />} />,
      dataIndex: 'id',
      key: 'pair',
      render: (id: BigNumber, row: ShieldClosedOrderInfo) => {
        return (
          <PairLabel
            pair={{ indexUnderlying: row.underlying, quoteToken: row.token }}
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
        <TableMobileTitle
          itemTop={<I18n id={'trade-option-type'} />}
          itemBottom={<I18n id={'trade-order-close-time'} />}
        />
      ),
      dataIndex: 'openTime',
      key: 'time',
      render: (time: number, row: ShieldClosedOrderInfo) => {
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
      render: (amount: SldDecimal, row: ShieldClosedOrderInfo) => {
        return (
          <div className={styles.cellGroup}>
            <div className={styleMerge(styles.cellMain)}>
              <TokenAmountInline
                amount={amount}
                token={row.underlying}
                numClassName={styles.value}
                symClassName={styles.cellDesc}
                fix={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
                rmZero={true}
              />
            </div>

            <div className={styleMerge(styles.cellDesc)}>
              <TokenAmountInline
                amount={row.pnl}
                token={row.token.symbol}
                numClassName={styleMerge(
                  cssPick(row.pnl.gtZero(), styles.cellDescLong),
                  cssPick(row.pnl.ltZero(), styles.cellDescShort)
                )}
                symClassName={styles.cellDesc}
                short={true}
                sign={true}
                rmZero={true}
                fix={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
                precision={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
              />
            </div>
          </div>
        );
      },
    },
  ];

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('ordersRs', D.Option.ClosedOrders);
    this.registerStatePending('ordersRsPending', D.Option.ClosedOrders);
    this.registerObservable('curUserAddress', walletState.USER_ADDR);
    this.registerObservable('network', walletState.NETWORK);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClickMore() {
    P.Option.Trade.OrderHistory.PageIndex.set(P.Option.Trade.OrderHistory.PageIndex.get() + 1);
  }

  rowRender(row: ShieldClosedOrderInfo) {
    const gap = '10px';

    return (
      <div className={styleMerge(styles.extRow)}>
        <VerticalItem
          label={<I18n id={'trade-open-time'} />}
          align={'left'}
          labelClassName={styleMerge(styles.label)}
          gap={gap}
        >
          <span className={styleMerge(styles.value)}>{formatMinute(row.openTime)}</span>
        </VerticalItem>

        <VerticalItem
          label={<I18n id={'trade-order-close-time'} />}
          align={'right'}
          labelClassName={styleMerge(styles.label)}
          gap={gap}
        >
          <span className={styleMerge(styles.value)}> {formatMinute(row.closeTime)}</span>
        </VerticalItem>

        <VerticalItem
          label={<I18n id={'trade-index-open-price'} />}
          align={'left'}
          labelClassName={styleMerge(styles.label)}
          gap={gap}
        >
          <TokenAmountInline
            amount={row.openPrice}
            token={''}
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
            token={''}
            numClassName={styles.value}
            symClassName={styles.label}
          />
        </VerticalItem>

        <VerticalItem
          label={<I18n id={'trade-funding-fee-paid'} />}
          align={'left'}
          labelClassName={styleMerge(styles.label)}
          gap={gap}
        >
          <TokenAmountInline
            amount={row.fundingFeePaid}
            token={row.token.symbol}
            numClassName={styles.value}
            symClassName={styles.label}
            rmZero={true}
            fix={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
            precision={SLD_ENV_CONF.FixDigits.Open[row.underlying]}
          />
        </VerticalItem>
      </div>
    );
  }

  private getDataSource(): ShieldClosedOrderInfo[] | undefined {
    const isLoading: boolean =
      !this.state.ordersRs ||
      this.state.ordersRs.network !== this.state.network ||
      !isSameAddress(this.state.curUserAddress, this.state.ordersRs.taker);

    return isLoading ? undefined : this.state.ordersRs?.orders;
  }

  render() {
    const datasource: ShieldClosedOrderInfo[] | undefined = this.getDataSource();

    const len = datasource?.length || 0;
    const index = P.Option.Trade.OrderHistory.PageIndex.get();
    const size = P.Option.Trade.OrderHistory.PageSize.get();
    const maxCount = (index + 1) * size;
    const hasMore = ((datasource?.length || 0) > 0 && len >= maxCount) || this.state.ordersRsPending;

    return this.state.isMobile ? (
      <TableForMobile
        datasource={datasource}
        columns={this.columnsMobile}
        rowKey={(row: ShieldClosedOrderInfo) => row.id.toString()}
        hasMore={hasMore}
        showMore={this.onClickMore.bind(this)}
        loadingMore={this.state.ordersRsPending}
        rowRender={this.rowRender.bind(this)}
      />
    ) : (
      <TableForDesktop
        datasource={datasource}
        columns={this.columns}
        rowKey={(row: ShieldClosedOrderInfo) => row.id.toString()}
        hasMore={hasMore}
        showMore={this.onClickMore.bind(this)}
        loadingMore={this.state.ordersRsPending}
      />
    );
  }
}
