import { BaseStateComponent } from '../../state-manager/base-state-component';
import { Empty } from 'antd';
import noData from '../../assets/imgs/trade/no-data.svg';
import { I18n } from '../i18n/i18n';

type IProps = {
  desc?: string;
};
type IState = {};

export class TableNodata extends BaseStateComponent<IProps, IState> {
  render() {
    return <Empty image={noData} description={this.props.desc ? this.props.desc : <I18n id={'com-no-data'} />} />;
  }
}
