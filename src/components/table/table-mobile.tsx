import { BaseStateComponent } from '../../state-manager/base-state-component';
import tables from './table-common.module.less';
import { TableLoading } from './table-loading';
import { ConfigProvider, Table, TablePaginationConfig } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import { ReactNode } from 'react';
import { TableMore } from './table-more';
import { P } from '../../state-manager/page/page-state-parser';
import { RightOutlined } from '@ant-design/icons';
import { cssPick, styleMerge } from '../../util/string';
import { TableNodata } from './table-nodata';

type IProps = {
  datasource: any[] | undefined;
  columns: ColumnType<any>[];
  rowKey?: string | ((row: any) => string);
  rowRender?: (row: any) => ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  loading?: boolean;
  showMore?: () => void;
  scrollY?: number;
  layout?: 'auto' | 'fixed';
  isDark?: boolean;
  pagination?: TablePaginationConfig | false;
};
type IState = {
  isMobile: boolean;
};

export class TableForMobile extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onShowMore() {
    if (this.props.showMore) {
      this.props.showMore();
    }
  }

  render() {
    const useExpand: boolean = !!this.props.rowRender;
    const expandable = useExpand
      ? {
          expandedRowRender: this.props.rowRender,
          expandRowByClick: true,
          expandIcon: (props: any) => {
            return <RightOutlined className={props.expanded ? tables.expandIconDown : tables.expandIcon} />;
          },
        }
      : undefined;

    return (
      <div className={styleMerge(tables.sldMobileTable, cssPick(this.props.isDark, tables.dark))}>
        {this.props.datasource === undefined || this.props.loading ? (
          <TableLoading isDark={this.props.isDark} />
        ) : (
          <>
            <ConfigProvider renderEmpty={() => <TableNodata />}>
              <Table
                dataSource={this.props.datasource}
                columns={this.props.columns}
                rowKey={this.props.rowKey}
                pagination={this.props.pagination || false}
                size={'middle'}
                scroll={{ x: true, y: this.props.scrollY }}
                expandable={expandable}
                tableLayout={this.props.layout}
              />
            </ConfigProvider>

            {this.props.hasMore ? (
              <TableMore
                show={this.props.hasMore}
                loading={this.props.loadingMore || false}
                onClick={this.onShowMore.bind(this)}
              />
            ) : null}
          </>
        )}
      </div>
    );
  }
}
