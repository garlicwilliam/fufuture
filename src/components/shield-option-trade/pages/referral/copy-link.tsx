import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, genReferralCode } from '../../../../util/string';
import styles from './copy-link.module.less';
import { I18n } from '../../../i18n/i18n';
import CopyToClipboard from 'react-copy-to-clipboard';
import { message } from 'antd';
import { prefixPath } from '../../../common/utils/location-wrapper';
import { RouteKey } from '../../../../constant/routes';
import { walletState } from '../../../../state-manager/wallet/wallet-state';

type IState = {
  isMobile: boolean;
  userAddress: string;
};
type IProps = {};

export class CopyLink extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    userAddress: '',
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('userAddress', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const code = genReferralCode(this.state.userAddress);
    const url = window.location.origin + prefixPath + '/' + RouteKey.r + '?r=' + code;

    return (
      <CopyToClipboard text={url} onCopy={() => message.success(<I18n id={'com-copied'} />)}>
        <div className={styleMr(styles.wrapperCopy)}>
          <div className={styleMr(styles.form)}>{url}</div>
          <div className={styleMr(styles.copy)}>
            {this.state.isMobile ? <I18n id={'trade-copy-referral-short'} /> : <I18n id={'trade-copy-referral'} />}
          </div>
        </div>
      </CopyToClipboard>
    );
  }
}
