import { BaseStateComponent } from '../../../state-manager/base-state-component';
import React from 'react';
import styles from './overlay-close.module.less';
import { styleMerge } from '../../../util/string';
import { P } from '../../../state-manager/page/page-state-parser';
import { CloseOutlined } from '@ant-design/icons';

type SizeType = 'small' | 'normal' | 'large';

type IProps = {
  onClose: () => void;
  size?: SizeType;
  padding?: number;
};
type IState = {
  isMobile: boolean;
};

export class OverlayClose extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  readonly sizeClass: { [k in SizeType]: string } = {
    small: styles.small,
    normal: styles.middle,
    large: styles.large,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const sizeCss = this.props.size ? this.sizeClass[this.props.size] : styles.middle;
    const styleCss = this.props.padding ? { top: this.props.padding + 'px', right: this.props.padding + 'px' } : {};

    return (
      <div className={styleMerge(styles.close, sizeCss)} onClick={this.props.onClose.bind(this)} style={styleCss}>
        <CloseOutlined />
      </div>
    );
  }
}
