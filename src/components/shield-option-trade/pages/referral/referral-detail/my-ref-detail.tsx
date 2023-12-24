import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './my-ref-detail.module.less';
import { ReferralsTable } from './referrals-table';
import { BlockTitle } from '../../common/block-title';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class MyRefDetail extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.detailWrapper)}>
        <BlockTitle title={'Referral Details'} />
        <div></div>
        <ReferralsTable />
      </div>
    );
  }
}
