import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './text-btn.module.less';
import { styleMerge } from '../../../util/string';

type IProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  stopPropagation?: boolean;
};
type IState = {
  isMobile: boolean;
};

export class TextBtn extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClick(event: React.MouseEvent) {
    if (this.props.stopPropagation) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.props.onClick && !this.props.disabled) {
      this.props.onClick();
    }
  }

  render() {
    const disableCss = this.props.disabled ? styles.disabled : '';
    return (
      <div
        className={styleMerge(styles.textButton, disableCss, this.props.className)}
        onClick={this.onClick.bind(this)}
      >
        {this.props.children}
      </div>
    );
  }
}
