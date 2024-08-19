import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge, StyleMerger } from '../../../util/string';
import { Network } from '../../../constant/network';
import { NetworkIcons, NetworkLabels } from '../../../constant/network-conf';

type IState = {
  isMobile: boolean;
};
type IProps = {
  networks: Network[];
  className?: string;
  onSelect?: (network: Network) => void;
};

export class ChainSelect extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onSelect(net: Network) {
    if (this.props.onSelect) {
      this.props.onSelect(net);
    }
  }

  render() {
    return (
      <div className={styleMerge('sld_network_list', this.props.className)}>
        {this.props.networks.map((network: Network) => {
          return (
            <div className={styleMerge('sld_network_item')} onClick={() => this.onSelect(network)}>
              <span className={styleMerge('sld_network_item_icon')}>
                <img src={NetworkIcons[network]} alt={''} />
              </span>{' '}
              <span className={styleMerge('sld_network_item_label')}>{NetworkLabels[network]}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
