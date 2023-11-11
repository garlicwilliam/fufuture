import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './select-btn.module.less';
import { styleMerge } from '../../../util/string';
import { WalletButtonStyleType } from '../../connect-wallet/common-types';

type IProps = {
  isActivate: boolean;
  isSelected: boolean;
  onClick?: () => void;
  bottomMargin?: number;
  disabled?: boolean;
  styleType?: WalletButtonStyleType | undefined;
};
type IState = {};

export class SelectButton extends BaseStateComponent<IProps, IState> {
  state: IState = {};

  componentDidMount() {}

  componentWillUnmount() {
    this.destroyState();
  }

  onClickBtn() {
    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const marginBottom: string = this.props.bottomMargin ? this.props.bottomMargin + 'px' : '0px';

    const mainStyleCss =
      !this.props.styleType || this.props.styleType === 'normal'
        ? styles.selectNormal
        : this.props.styleType === 'union'
        ? styles.selectUnion
        : this.props.styleType === 'vesting'
        ? styles.selectVesting
        : this.props.styleType === 'popup'
        ? styles.selectSquare
        : styles.selectNormal;
    const activeCss = this.props.isActivate ? styles.active : '';
    const selectCss = this.props.isSelected ? styles.selected : '';
    const disableCss = this.props.disabled ? styles.disabled : '';

    return (
      <div
        className={styleMerge(styles.selectButton, mainStyleCss, activeCss, selectCss, disableCss)}
        style={{ marginBottom: marginBottom }}
        onClick={this.onClickBtn.bind(this)}
      >
        {this.props.children}
      </div>
    );
  }
}
