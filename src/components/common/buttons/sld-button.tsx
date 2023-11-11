import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './sld-button.module.less';
import { cssPick, styleMerge } from '../../../util/string';
import { P } from '../../../state-manager/page/page-state-parser';

type IProps = {
  size: 'tiny' | 'small' | 'large' | 'huge';
  type: 'primary' | 'default' | 'primaryNoBg' | 'none';
  isDark?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  stopPropagation?: boolean;
};
type IState = {
  isMobile: boolean;
};

export class SldButton extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClickBtn(event) {
    if (this.props.stopPropagation) {
      event.stopPropagation();
      event.preventDefault(true);
    }

    if (this.props.disabled) {
      return;
    }

    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const sizeCss =
      this.props.size === 'small'
        ? styles.small
        : this.props.size === 'tiny'
        ? styles.tiny
        : this.props.size === 'large'
        ? styles.large
        : styles.huge;

    const typeCss =
      this.props.type === 'primary'
        ? styles.primary
        : this.props.type === 'primaryNoBg'
        ? styles.primaryNoBg
        : this.props.type === 'none'
        ? ''
        : styles.default;
    const darkCss = this.props.isDark === true ? styles.dark : '';
    const disableCss = this.props.disabled === true ? styles.disable : '';

    return (
      <div
        className={styleMerge(
          'sld_button',
          cssPick(this.props.disabled === true, 'sld_button_disabled'),
          styles.sldButton,
          sizeCss,
          typeCss,
          darkCss,
          disableCss,
          this.props.className
        )}
        onClick={this.onClickBtn.bind(this)}
      >
        {this.props.children}
      </div>
    );
  }
}
