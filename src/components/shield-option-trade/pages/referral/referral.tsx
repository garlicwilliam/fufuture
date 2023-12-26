import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './referral.module.less';
import { PageTitle } from '../common/page-title';
import { I18n } from '../../../i18n/i18n';
import { CopyLink } from './copy-link';
import { FixPadding } from '../../../common/content/fix-padding';
import { Outlet } from 'react-router-dom';
import { RouteKey } from '../../../../constant/routes';

type IState = {
  isMobile: boolean;
  location?: Location;
};
type IProps = {};

export class TradeReferral extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerNavLocation('location');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const isInDetail: boolean =
      !!this.state.location && this.state.location.pathname.indexOf(RouteKey.sub_ReferralDetail) >= 0;

    return (
      <div className={styleMr(styles.wrapperReferral)}>
        <PageTitle
          title={<I18n id={'trade-referrals'} textUpper={'uppercase'} />}
          backRoute={isInDetail ? RouteKey.referral : undefined}
        />

        <CopyLink />

        <FixPadding top={60} bottom={0} mobTop={40} mobBottom={0}>
          <Outlet />
        </FixPadding>
      </div>
    );
  }
}
