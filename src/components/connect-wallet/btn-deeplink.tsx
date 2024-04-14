import { BaseStateComponent } from '../../state-manager/base-state-component';
import { P } from '../../state-manager/page/page-state-parser';
import { SelectButton } from '../common/buttons/select-btn';
import { iconNode, WALLET_NAME_MAP } from './wallet-icons';
import { EthereumProviderName, WalletConnectWalletName } from '../../wallet/define';
import { toBase64 } from 'js-base64';

type IState = {
  isMobile: boolean;
};
type IProps = {
  name: EthereumProviderName | WalletConnectWalletName;
  page?: string;
};

function openApp(deepLink, fallbackURL) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.src = deepLink;

  setTimeout(function () {
    document.body.removeChild(iframe);
    // 检测当前页面是否保持焦点
    if (document.hasFocus()) {
      window.location = fallbackURL;
    }
  }, 500);
}

export class DeeplinkButton extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClick() {
    switch (this.props.name) {
      case EthereumProviderName.MetaMask:
        window.location.href = 'https://metamask.app.link/dapp/' + window.location.hostname;
        break;
      case WalletConnectWalletName.Binance || EthereumProviderName.Binance:
        const url: string = this.props.page
          ? toBase64('url=' + this.props.page)
          : window.location.hostname.indexOf('carnival') >= 0
          ? 'dXJsPWh0dHBzOi8vY2Fybml2YWwuc3Rha2VzdG9uZS5pbw=='
          : 'dXJsPWh0dHBzOi8vYXBwLnN0YWtlc3RvbmUuaW8=';
        const deepLink: string = `bnc://app.binance.com/mp/app?appId=yFK5FCqYprrXDiVFbhyRx7&startPagePath=L3BhZ2VzL2Jyb3dzZXIvaW5kZXg=&startPageQuery=${url}`;
        const downLink: string =
          'https://app.binance.com/en/download?_dp=Ym5jOi8vYXBwLmJpbmFuY2UuY29tL21wL2FwcD9hcHBJZD15Rks1RkNxWXByclhEaVZGYmh5Ung3JnN0YXJ0UGFnZVBhdGg9TDNCaFoyVnpMMkp5YjNkelpYSXZhVzVrWlhnPSZzdGFydFBhZ2VRdWVyeT1kWEpzUFdoMGRIQnpPaTh2WVhCd0xuTjBZV3RsYzNSdmJtVXVhVzg9';
        openApp(deepLink, downLink);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <SelectButton isActivate={false} isSelected={false} onClick={this.onClick.bind(this)} styleType={'normal'}>
        {iconNode(this.props.name)} {WALLET_NAME_MAP[this.props.name]}
      </SelectButton>
    );
  }
}
