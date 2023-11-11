import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../util/string';
import styles from './horizon-item.module.less';
import { ReactNode } from 'react';

type IState = {
  isMobile: boolean;
};
type IProps = {
  label: ReactNode;
  align: 'justify' | 'left' | 'right';
  separator?: ReactNode;
  labelClass?: string;
  valueClass?: string;
  className?: string;
};

export class HorizonItem extends BaseStateComponent<IProps, IState> {
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
    const alignCss: string =
      this.props.align === 'justify' ? styles.justify : this.props.align === 'right' ? styles.right : styles.left;

    return (
      <div className={styleMr(styles.wrapperHorizon, alignCss, this.props.className)}>
        <div className={styleMr(styles.label, this.props.labelClass)}>
          {this.props.label}
          {this.props.separator}
        </div>

        <div className={styleMr(styles.value, this.props.valueClass)}>{this.props.children}</div>
      </div>
    );
  }
}
