import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge } from '../../../../../util/string';
import styles from './referrals-table.module.less';
import { TableForDesktop } from '../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import {
  ShieldBrokerReferralInfo,
  ShieldBrokerReferralRs,
  ShieldTakerTradingFee,
  StateNullType,
} from '../../../../../state-manager/state-types';
import { I18n } from '../../../../i18n/i18n';
import { shortAddress } from '../../../../../util';
import { formatTime } from '../../../../../util/time';
import { D } from '../../../../../state-manager/database/database-state-parser';
import { snRep } from '../../../../../state-manager/interface-util';
import { Pagination } from 'antd';
import { FixPadding } from '../../../../common/content/fix-padding';
import { TokenAmountInline } from '../../../../common/content/token-amount-inline';
import { Network } from '../../../../../constant/network';
import { walletState } from '../../../../../state-manager/wallet/wallet-state';
import { isSameAddress } from '../../../../../util/address';
import { ReferralsStatistic } from './referrals-statistic';
import { fontCss } from '../../../../i18n/font-switch';
import { TableMobileTitle } from '../../../../table/table-mobile-title';
import { TableForMobile } from '../../../../table/table-mobile';
import { ReactNode } from 'react';

type IState = {
  isMobile: boolean;
  referralRs: ShieldBrokerReferralRs | StateNullType | undefined;
  referralRsPending: boolean;
  pageSize: number;
  pageIndex: number;
  network: Network | null;
  broker: string | null;
};
type IProps = {};

export class ReferralsTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    referralRs: undefined,
    referralRsPending: false,
    pageSize: P.Option.Referral.Detail.PageSize.get(),
    pageIndex: P.Option.Referral.Detail.PageIndex.get(),
    network: null,
    broker: null,
  };

  columns: ColumnType<ShieldBrokerReferralInfo>[] = [
    {
      title: <I18n id={'trade-referral-time'} />,
      dataIndex: 'invitationTime',
      key: 'invitationTime',
      render: (time: number) => {
        return formatTime(time);
      },
    },
    {
      title: <I18n id={'trade-taker-address'} />,
      dataIndex: 'takerAddress',
      key: 'takerAddress',
      render: (referral: string) => {
        return shortAddress(referral);
      },
    },
    {
      title: <I18n id={'trade-taker-order-count'} />,
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (count: number) => {
        return count;
      },
    },
    {
      title: <I18n id={'trade-taker-latest-open-time'} />,
      dataIndex: 'lastOpenTime',
      key: 'lastOpenTime',
      render: (time: number) => {
        return time === 0 ? '--' : formatTime(time);
      },
    },
    {
      title: <I18n id={'trade-taker-trading-fee-paid'} />,
      dataIndex: 'tradingFee',
      key: 'tradingFee',
      align: 'right',
      render: (fees: ShieldTakerTradingFee[]) => {
        return (
          <div className={styles.feeCell}>
            {fees.map(fee => {
              return (
                <TokenAmountInline
                  key={fee.token.address}
                  short={true}
                  amount={fee.amount}
                  token={fee.token.symbol}
                  symClassName={styles.label}
                />
              );
            })}
          </div>
        );
      },
    },
  ];

  columnsMobile: ColumnType<ShieldBrokerReferralInfo>[] = [
    {
      title: (
        <TableMobileTitle
          itemTop={<I18n id={'trade-taker-address'} />}
          itemBottom={<I18n id={'trade-referral-time'} />}
        />
      ),
      dataIndex: 'invitationTime',
      key: 'invitationTime',
      render: (time: number, row: ShieldBrokerReferralInfo) => {
        return (
          <div className={styles.smallGroup}>
            <div className={styleMerge(styles.smallVal, fontCss.boldLatin)}>{shortAddress(row.takerAddress)}</div>
            <div className={styles.smallDesc}>{formatTime(time)}</div>
          </div>
        );
      },
    },
    {
      title: (
        <TableMobileTitle
          pullRight={true}
          itemTop={<I18n id={'trade-taker-order-count'} />}
          itemBottom={<I18n id={'trade-taker-latest-open-time'} />}
        />
      ),
      dataIndex: 'orderCount',
      key: 'orderCount',
      align: 'right',
      render: (count: number, row: ShieldBrokerReferralInfo) => {
        return (
          <div className={styles.smallGroup}>
            <div className={styles.smallVal}>{count}</div>
            <div className={styles.smallDesc}>{row.lastOpenTime === 0 ? '--' : formatTime(row.lastOpenTime)}</div>
          </div>
        );
      },
    },
  ];

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('referralRs', D.Option.Referrals.Details);
    this.registerState('pageSize', P.Option.Referral.Detail.PageSize);
    this.registerState('pageIndex', P.Option.Referral.Detail.PageIndex);
    this.registerStatePending('referralRsPending', D.Option.Referrals.Details);
    this.registerObservable('network', walletState.NETWORK);
    this.registerObservable('broker', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  rowRender(row: ShieldBrokerReferralInfo): ReactNode {
    return (
      <div className={styles.expandRow}>
        <div className={styles.smallDesc}>
          <I18n id={'trade-taker-trading-fee-paid'} />
        </div>
        <div className={styles.feeRow}>
          {row.tradingFee.map(fee => {
            return (
              <TokenAmountInline
                key={fee.token.address}
                short={true}
                amount={fee.amount}
                token={fee.token.symbol}
                symClassName={styles.smallDesc}
              />
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const rs = snRep(this.state.referralRs);

    const dataSource =
      rs === undefined
        ? undefined
        : rs === null
        ? []
        : rs.network !== this.state.network ||
          !this.state.broker ||
          !isSameAddress(rs.broker.brokerAddress, this.state.broker)
        ? undefined
        : rs.takers;

    return (
      <div className={styleMr(styles.tableOuter)}>
        <ReferralsStatistic broker={rs === null ? null : rs?.broker} />

        <div className={styleMr(styles.detailBlock)}>
          <div className={styleMr(styles.detailTitle, fontCss.bold)}>
            <I18n id={'trade-referral-list'} />
          </div>
          <div>
            {this.state.isMobile ? (
              <TableForMobile
                datasource={dataSource}
                columns={this.columnsMobile}
                loading={this.state.referralRsPending}
                rowKey={(row: ShieldBrokerReferralInfo) => row.takerAddress}
                rowRender={this.rowRender.bind(this)}
              />
            ) : (
              <TableForDesktop
                datasource={dataSource}
                columns={this.columns}
                loading={this.state.referralRsPending}
                rowKey={(row: ShieldBrokerReferralInfo) => row.takerAddress}
              />
            )}

            <FixPadding top={20} bottom={0} mobTop={20} mobBottom={0}>
              <Pagination
                pageSize={this.state.pageSize}
                current={this.state.pageIndex + 1}
                total={rs?.broker.referralCount}
                onChange={(page: number, pageSize: number) => {
                  P.Option.Referral.Detail.PageIndex.set(page - 1);
                }}
              />
            </FixPadding>
          </div>
        </div>
      </div>
    );
  }
}
