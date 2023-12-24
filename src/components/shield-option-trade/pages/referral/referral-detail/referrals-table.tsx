import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
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
        return formatTime(time);
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
                <>
                  <TokenAmountInline
                    key={fee.token.address}
                    short={true}
                    amount={fee.amount}
                    token={fee.token.symbol}
                    symClassName={styles.label}
                  />
                </>
              );
            })}
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
        <ReferralsStatistic broker={rs?.broker} />

        <TableForDesktop
          datasource={dataSource}
          columns={this.columns}
          loading={this.state.referralRsPending}
          rowKey={(row: ShieldBrokerReferralInfo) => row.takerAddress}
        />

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
    );
  }
}
