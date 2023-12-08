import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import noData from '../../../assets/imgs/trade/no-data.svg';
import { I18n } from '../../i18n/i18n';
import { Empty } from 'antd';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class SldEmpty extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    return <Empty image={noData} description={<I18n id={'com-no-data'} />} />;
  }
}
