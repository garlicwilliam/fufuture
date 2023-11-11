import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../util/string';
import styles from './vertical-item.module.less';
import { ReactNode } from 'react';
import { Visible } from '../../builtin/hidden';

type IState = {
  isMobile: boolean;
};
type IProps = {
  label: ReactNode;
  valueClassName?: string;
  labelClassName?: string;
  labelPos?: 'top' | 'bottom';
  align?: 'left' | 'right' | 'center';
  gap?: string;
  className?: string;
};

export class VerticalItem extends BaseStateComponent<IProps, IState> {
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
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);
    const labelPos = this.props.labelPos || 'top';
    const alignCss =
      this.props.align === 'left' ? styles.left : this.props.align === 'right' ? styles.right : styles.center;

    return (
      <div className={styleMr(styles.wrapper, alignCss, this.props.className)} style={{ gridRowGap: this.props.gap }}>
        <Visible when={labelPos === 'top'}>
          <div className={styleMr(styles.label, this.props.labelClassName)}>{this.props.label}</div>
        </Visible>

        <div className={styleMr(styles.value, this.props.valueClassName)}>{this.props.children}</div>

        <Visible when={labelPos === 'bottom'}>
          <div className={styleMr(styles.label, this.props.labelClassName)}>{this.props.label}</div>
        </Visible>
      </div>
    );
  }
}
