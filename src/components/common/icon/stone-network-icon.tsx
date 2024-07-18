import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../util/string';
import styles from './stone-network-icon.module.less';
import stone from '../../../assets/imgs/tokens/stone.svg';
import { Network } from '../../../constant/network';
import { NetworkIcons } from '../../../constant/network-conf';

type IState = {
  isMobile: boolean;
};
type IProps = {
  network: Network;
};

export class StoneNetworkIcon extends BaseStateComponent<IProps, IState> {
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
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    const netIcon: string = NetworkIcons[this.props.network];

    return (
      <div className={styleMr(styles.icon, 'sld_stone_icon')}>
        <img src={stone} alt="stone" height={22} />
        <div className={styleMr(styles.chain, 'sld_stone_net_icon')}>
          {netIcon ? <img src={netIcon} alt={''} height={12} width={12} /> : <>?</>}
        </div>
      </div>
    );
  }
}
