import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './pools-table.module.less';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { SldDecimal } from '../../../../../../util/decimal';
import { I18n } from '../../../../../i18n/i18n';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import {
  ShieldTokenPoolLiquidity,
  ShieldTokenPoolLiquidityList,
  TokenErc20,
} from '../../../../../../state-manager/state-types';
import { TokenLabel } from '../../../common/token-label';
import { TableForDesktop } from '../../../../../table/table-desktop';
import { ColumnType } from 'antd/lib/table/interface';
import { IndexUnderlyingType } from '../../../../const/assets';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

type IState = {
  isMobile: boolean;
  tableList: ShieldTokenPoolLiquidityList | null;
  index: IndexUnderlyingType;
  columns: ColumnType<ShieldTokenPoolLiquidity>[];
};
type IProps = {};

export class PoolsTable extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    tableList: null,
    index: P.Option.Trade.Select.IndexUnderlying.get(),
    columns: [],
  };

  private genColumns(): ColumnType<ShieldTokenPoolLiquidity>[] {
    return [
      {
        title: <I18n id={'trade-fees-funding'} />,
        dataIndex: 'token',
        key: 'token',
        render: (token: TokenErc20) => {
          return <TokenLabel token={token} useCopy={true} size={this.state.isMobile ? 'tiny' : 'small'} />;
        },
      },
      {
        title: <I18n id={'trade-liquidity'} />,
        dataIndex: 'token',
        key: 'liquidity',
        align: 'center',
        render: (token, row: ShieldTokenPoolLiquidity) => {
          return (
            <TokenAmountInline
              short={true}
              amount={row.privateLiquidity.add(row.publicLiquidity)}
              token={row.token.symbol}
              symClassName={styles.symStyle}
            />
          );
        },
      },
      {
        title: <I18n id={'trade-24h-volume'} />,
        dataIndex: 'token',
        key: 'volume',
        align: 'right',
        render: (token, row: ShieldTokenPoolLiquidity) => {
          return (
            <TokenAmountInline
              short={true}
              amount={SldDecimal.ZERO}
              token={row.indexUnderlying}
              symClassName={styles.symStyle}
            />
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('tableList', S.Option.Market.Select.List);
    this.registerState('index', P.Option.Trade.Select.IndexUnderlying);

    this.registerObservable('columns', this.mergeColumns());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeColumns(): Observable<ColumnType<ShieldTokenPoolLiquidity>[]> {
    return this.watchStateChange('isMobile').pipe(
      map(() => {
        return this.genColumns();
      })
    );
  }

  onSelect(liquidity: ShieldTokenPoolLiquidity) {
    P.Option.Trade.Pair.Base.set(liquidity.indexUnderlying);
    P.Option.Trade.Pair.Quote.set(liquidity.token);
    P.Option.Trade.Select.Extend.set(false);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const scrollY = this.state.isMobile ? Math.max(window.innerHeight - 430, 180) : 370;

    const source =
      this.state.tableList && this.state.index === this.state.tableList.indexUnderlying
        ? this.state.tableList.liquidity
        : undefined;

    return (
      <>
        <TableForDesktop
          rowKey={(row: ShieldTokenPoolLiquidity) => row.token.address}
          datasource={source}
          columns={this.state.columns}
          onRowClick={this.onSelect.bind(this)}
          scrollY={scrollY}
        />
      </>
    );
  }
}
