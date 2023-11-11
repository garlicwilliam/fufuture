import { BaseStateComponent } from '../../state-manager/base-state-component';
import tables from './table-common.module.less';
import { Button } from 'antd';
import { LoadingOutlined, DownOutlined } from '@ant-design/icons';
import { I18n } from '../i18n/i18n';

type IProps = {
  show: boolean;
  loading: boolean;
  onClick?: () => void;
};

export class TableMore extends BaseStateComponent<IProps, any> {
  onClickMore() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    return this.props.show ? (
      <div className={tables.more}>
        {this.props.loading ? (
          <Button type="link">
            <LoadingOutlined />
          </Button>
        ) : (
          <Button type="link" onClick={this.onClickMore.bind(this)}>
            <span>
              <I18n id={'com-more'} />
              &nbsp;
              <DownOutlined />
            </span>
          </Button>
        )}
      </div>
    ) : null;
  }
}
