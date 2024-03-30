import { BaseStateComponent } from '../../state-manager/base-state-component';
import { P } from '../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../util/string';
import styles from './wallet-connect.modal.module.less';
import ModalRender from '../modal-render';
import { wcModalService, WcWalletInfo } from '../../services/wc-modal/wc-modal.service';
import { genQrCode } from '../lib/wc-qrcode/wc-qrcode';
import ios from '../../assets/imgs/wallet/app-store.svg';
import android from '../../assets/imgs/wallet/google-play.svg';

type IState = {
  isMobile: boolean;
};
type IProps = {
  visible: boolean;
  walletInfo?: WcWalletInfo;
};

export class WalletConnectModal extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  size = 282;
  icon = 85;

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClose() {
    wcModalService.cancel();
  }

  onQr(dom) {
    if (dom && this.props.walletInfo) {
      genQrCode(this.props.walletInfo.uri, this.size, 85, dom);
    }
  }

  goDownload(url: string | undefined) {
    if (this.props.walletInfo && url) {
      window.open(url, '_blank');
    }
  }

  render() {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return (
      <ModalRender
        footer={null}
        title={'Connect with ' + this.props.walletInfo?.nameShort}
        className={'sld-wallet-connect-modal'}
        visible={this.props.visible}
        onCancel={this.onClose.bind(this)}
        onClose={this.onClose.bind(this)}
        height={500}
      >
        <div className={styleMr(styles.codeArea)}>
          <img
            className={styleMr(styles.icon)}
            src={this.props.walletInfo?.icon}
            width={this.icon}
            height={this.icon}
            alt={''}
          />
          <svg width={this.size} height={this.size} ref={dom => this.onQr(dom)}></svg>
        </div>

        <div className={styleMr(styles.tips)}>Scan with your wallet. </div>

        <div className={styleMr(styles.downloadArea)}>
          <div className={styleMr(styles.tips)}>Don't have the app? Download it from the app store.</div>
          <div className={styleMr(styles.downloads)}>
            <div>
              <img
                src={ios}
                alt={''}
                height={40}
                onClick={() => this.goDownload(this.props.walletInfo?.download.ios)}
              />
            </div>
            <div>
              <img
                src={android}
                alt={''}
                height={40}
                onClick={() => this.goDownload(this.props.walletInfo?.download.android)}
              />
            </div>
          </div>
        </div>
      </ModalRender>
    );
  }
}
