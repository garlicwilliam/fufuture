import { BaseStateComponent } from '../../state-manager/base-state-component';
import { TableLoading } from './table-loading';
import { ConfigProvider, Table, TablePaginationConfig } from 'antd';
import { TableNodata } from './table-nodata';
import { ColumnType } from 'antd/lib/table/interface';
import { TableMore } from './table-more';
import tables from './table-common.module.less';
import { ReactNode } from 'react';
import { RightOutlined } from '@ant-design/icons';
import { cssPick, styleMerge } from '../../util/string';

export type IProps = {
  datasource: any[] | undefined;
  columns: ColumnType<any>[];
  rowKey?: string | ((row: any) => string);
  hasMore?: boolean;
  loadingMore?: boolean;
  loading?: boolean;
  showMore?: () => void;
  rowRender?: (row: any) => ReactNode;
  isDark?: boolean;
  scrollY?: number;
  pagination?: TablePaginationConfig | false;
  layout?: 'auto' | 'fixed';
  className?: string;
  noAction?: boolean;
  onRowClick?: (row: any) => void;
};
type IState = {
  isMobile: boolean;
};

export class TableForDesktop extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
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
      <div
        className={styleMerge(
          tables.sldTable,
          cssPick(this.props.isDark, tables.dark),
          cssPick(this.props.noAction, tables.noAction),
          this.props.className
        )}
      >
        {this.props.datasource === undefined || this.props.loading === true ? (
          <TableLoading isDark={this.props.isDark} />
        ) : (
          <ConfigProvider renderEmpty={() => <TableNodata />}>
            <Table
              columns={this.props.columns}
              dataSource={this.props.datasource}
              pagination={this.props.pagination || false}
              tableLayout={this.props.layout}
              scroll={{ y: this.props.scrollY }}
              rowKey={this.props.rowKey}
              expandable={expandable}
              className={this.props.className}
              onRow={record => {
                return {
                  onClick: () => {
                    if (this.props.onRowClick) {
                      this.props.onRowClick(record);
                    }
                  },
                };
              }}
            />
          </ConfigProvider>
        )}

        {this.props.hasMore ? (
          <TableMore
            show={this.props.hasMore}
            loading={this.props.loadingMore || false}
            onClick={this.props.showMore}
          />
        ) : null}
      </div>
    );
  }
}
