import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../util/string';
import styles from './network-selection.module.less';
import { SldSelect, SldSelectOption } from '../../common/selects/select';
import { Network } from '../../../constant/network';
import { NetworkIcons, NetworkLabels } from '../../../constant/network-conf';
import { ReactNode } from 'react';
import { I18n } from '../../i18n/i18n';

type IState = {
  isMobile: boolean;
};
type IProps = {
  supports: Network[];
  showLabel?: boolean;
  current?: Network;
  wrapperClassName?: string;
  dropdownClassName?: string;
  onNetChange?: (net: Network) => void;
  notSupport?: ReactNode;
};

export class NetworkSelection extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  genOptions(styleMr: StyleMerger): SldSelectOption[] {
    return this.props.supports.map((one: Network): SldSelectOption => {
      return {
        value: one,
        label: (
          <div className={styleMr(styles.item)}>
            <div className={styleMr(styles.iconImg)}>
              <img src={NetworkIcons[one]} alt={''} height={20} />
            </div>
            <span>{NetworkLabels[one]}</span>
          </div>
        ),
        labelActive: (
          <div className={styleMr(styles.activeItem)}>
            <img src={NetworkIcons[one]} alt={''} height={20} />
            {!this.props.showLabel ? <></> : <span>{NetworkLabels[one]}</span>}
          </div>
        ),
      };
    });
  }

  private genNotSupport(styleMr: StyleMerger): ReactNode {
    return (
      <div className={styleMr(styles.notSupport, 'network_not_support')}>
        <I18n id={'com-network-wrong'} />
      </div>
    );
  }

  onChange(val: Network) {
    if (this.props.onNetChange) {
      this.props.onNetChange(val);
    }
  }

  render(): JSX.Element {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return (
      <SldSelect
        options={this.genOptions(styleMr)}
        noBorder={true}
        curSelected={this.props.current}
        isFlex={true}
        placement={'bottom-end'}
        offset={4}
        emptyReplace={this.genNotSupport(styleMr)}
        noMatchReplace={this.props.notSupport || this.genNotSupport(styleMr)}
        trigger={'hover'}
        zIndex={1100}
        parentClassName={this.props.wrapperClassName}
        dropdownClassName={this.props.dropdownClassName}
        onChangeSelect={op => this.onChange(op.value as Network)}
      />
    );
  }
}
