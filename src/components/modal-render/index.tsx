import { Modal, Drawer } from 'antd';
import { BaseStateComponent } from '../../state-manager/base-state-component';
import { ModalProps } from 'antd/lib/modal/Modal';
import { DrawerProps } from 'antd/lib/drawer';
import { ReactNode } from 'react';
import { fontCss } from '../i18n/font-switch';
import { styleMerge } from '../../util/string';

type IState = { isMobile: boolean };
type IProps = {
  visible?: boolean;
  title?: ReactNode;
  height?: number | string;
  closable?: boolean;
  onCancel?: () => void;
  banDrawer?: boolean;
  noPadding?: boolean;
  isDark?: boolean;
} & ModalProps &
  DrawerProps;

export default class ModalRender extends BaseStateComponent<IProps, IState> {
  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  state: { isMobile: boolean } = {
    isMobile: false,
  };

  render() {
    const { visible, children, title, height, closable, onCancel, maskClosable } = this.props;
    const realTitle = <span className={fontCss.bold}>{title}</span>;

    let maskCssStyle = { backgroundColor: this.props.isDark ? 'rgba(255, 255, 255, 0.3)' : undefined };
    maskCssStyle = Object.assign(maskCssStyle, this.props.maskStyle || {});

    return this.state.isMobile && !this.props.banDrawer ? (
      <Drawer
        closable={closable}
        onClose={onCancel}
        title={realTitle}
        height={height}
        maskClosable={maskClosable}
        placement="bottom"
        className={styleMerge('drawRender', fontCss.mediumLatin, this.props.className)}
        destroyOnClose={true}
        visible={visible}
      >
        {children}
      </Drawer>
    ) : (
      <Modal
        open={visible}
        {...this.props}
        closable={closable}
        maskClosable={maskClosable}
        title={realTitle}
        onCancel={onCancel}
        maskStyle={maskCssStyle}
        className={styleMerge('modalRender', this.props.className, fontCss.mediumLatin)}
      >
        {children}
      </Modal>
    );
  }
}
