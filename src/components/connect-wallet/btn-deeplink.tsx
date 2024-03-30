import { BaseStateComponent } from '../../state-manager/base-state-component';
import { P } from '../../state-manager/page/page-state-parser';
import { SelectButton } from '../common/buttons/select-btn';
import { EthereumProviderName } from '../../constant';
import { iconNode, WALLET_ICONS_MAP, WALLET_NAME_MAP } from './wallet-icons';

type IState = {
  isMobile: boolean;
};
type IProps = {
  name: EthereumProviderName;
};

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
        window.location.href = 'https://metamask.app.link/dapp/app.stakestone.io';
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
