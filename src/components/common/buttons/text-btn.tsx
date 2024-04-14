import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './text-btn.module.less';
import { bindStyleMerger, cssPick, styleMerge, StyleMerger } from '../../../util/string';
import { P } from '../../../state-manager/page/page-state-parser';

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
    isMobile: P.Layout.IsMobile.get(),
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
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return (
      <div
        className={styleMr(
          styles.textButton,
          'sld-txt-button',
          cssPick(this.props.disabled, styles.disabled, 'sld-txt-button-disabled'),
          this.props.className
        )}
        onClick={this.onClick.bind(this)}
      >
        {this.props.children}
      </div>
    );
  }
}
