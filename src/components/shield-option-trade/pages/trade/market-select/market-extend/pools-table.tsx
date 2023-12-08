import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge } from '../../../../../../util/string';
import styles from './pools-table.module.less';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { SldDecimal } from '../../../../../../util/decimal';
import { I18n } from '../../../../../i18n/i18n';
import {
  ShieldTokenTradingVolume,
  ShieldTradingVolume,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../../../../state-manager/state-types';
import { TokenLabel } from '../../../common/token-label';
import { TableForDesktop } from '../../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { isSameAddress } from '../../../../../../util/address';
import { poolLiquidityService, TokenPool, TokenPoolList } from '../../../../services/shield-pool-liquidity.service';
import { LiquidityCell } from './liquidity-cell';
import { PoolsList } from './pools-list';

type IState = {
  isMobile: boolean;
  index: ShieldUnderlyingType;
  tableList2: TokenPoolList | null;
  volumes: ShieldTradingVolume | null;
  columns2: ColumnType<TokenPool>[];
};
type IProps = {
  searchKey?: string;
};

export class PoolsTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    index: P.Option.Trade.Select.IndexUnderlying.get(),
    tableList2: null,
    volumes: null,
    columns2: [],
  };

  private genColumns2(): ColumnType<TokenPool>[] {
    return [
      {
        title: <I18n id={'trade-fees-funding'} />,
        dataIndex: 'token',
        key: 'token',
        className: this.state.isMobile ? styles.mobileCellPadding : undefined,
        render: (token: TokenErc20) => {
          return <TokenLabel token={token} useCopy={true} size={this.state.isMobile ? 'tiny' : 'small'} />;
        },
      },
      {
        title: <I18n id={'trade-liquidity'} />,
        dataIndex: 'token',
        key: 'liquidity',
        align: 'right',
        className: this.state.isMobile ? styles.mobileCellPadding : undefined,
        render: (token, row: TokenPool) => {
          return <LiquidityCell tokenPool={row} />;
        },
      },
      {
        title: <I18n id={'trade-24h-volume'} />,
        dataIndex: 'token',
        key: 'volume',
        align: 'right',
        className: styleMerge(styles.lastCol, this.state.isMobile ? styles.mobileCellPadding : undefined),
        render: (token, row: TokenPool) => {
          return (
            <TokenAmountInline
              short={true}
              amount={row.volume || SldDecimal.ZERO}
              token={row.underlying}
              symClassName={styles.symStyle}
            />
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('tableList2', this.mergePoolList());
    this.registerState('index', P.Option.Trade.Select.IndexUnderlying);
    this.registerState('volumes', D.Option.Volume24hOfToken);
    this.registerObservable('columns2', this.mergeColumns2());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergePoolList(): Observable<TokenPoolList> {
    return P.Option.Trade.Select.IndexUnderlying.watch().pipe(
      switchMap(underlying => {
        return poolLiquidityService.watchPoolList(underlying);
      })
    );
  }

  mergeColumns2(): Observable<ColumnType<TokenPool>[]> {
    return this.watchStateChange('isMobile').pipe(
      map(() => {
        return this.genColumns2();
      })
    );
  }

  onSelect2(pool: TokenPool) {
    P.Option.Trade.Pair.Base.set(pool.underlying);
    P.Option.Trade.Pair.Quote.set(pool.token);
    P.Option.Trade.Select.Extend.set(false);
  }

  private getSource(): { source: TokenPool[] | undefined; underlying: ShieldUnderlyingType | undefined } {
    let source2 =
      this.state.tableList2 && this.state.index === this.state.tableList2.underlying
        ? this.state.tableList2.pools
        : undefined;

    if (source2 && this.state.volumes && this.state.volumes.indexUnderlying === this.state.tableList2?.underlying) {
      source2.forEach(one => {
        const vol: ShieldTokenTradingVolume | undefined = this.state.volumes?.tokens.find(tokenVol =>
          isSameAddress(one.token.address, tokenVol.token)
        );

        if (vol) {
          one.volume = vol.volume;
        }
      });
    }

    if (source2 && this.props.searchKey) {
      const searchKey: string = this.props.searchKey.toLowerCase();
      source2 = source2.filter(
        one => one.token.symbol.toLowerCase().indexOf(searchKey) >= 0 || isSameAddress(searchKey, one.token.address)
      );
    }

    return { source: source2, underlying: source2 ? this.state.tableList2?.underlying : undefined };
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);
    const scrollY = this.state.isMobile ? Math.max(window.innerHeight - 500, 120) : 300;

    const { source, underlying } = this.getSource();

    return this.state.isMobile ? (
      <PoolsList
        onSelect={this.onSelect2.bind(this)}
        tokenPools={source && underlying ? { pools: source, underlying } : undefined}
        maxHeight={scrollY + 50}
      />
    ) : (
      <TableForDesktop
        rowKey={(row: { token: TokenErc20 }) => row.token.address}
        datasource={source}
        columns={this.state.columns2}
        onRowClick={this.onSelect2.bind(this)}
        scrollY={scrollY}
      />
    );
  }
}
