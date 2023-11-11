import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './orders.module.less';
import { BlockTitle } from '../../common/block-title';
import { OrderTabs } from './order-tabs';
import { I18n } from '../../../../i18n/i18n';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class Orders extends BaseStateComponent<IProps, IState> {
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
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperOrder)}>
        <BlockTitle title={<I18n id={'trade-orders'} />} />

        <OrderTabs />
      </div>
    );
  }
}
