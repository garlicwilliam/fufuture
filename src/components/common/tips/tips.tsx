import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { InfoCircleOutlined } from '@ant-design/icons';
import { SldOverlay } from '../overlay/overlay';
import { ReactNode } from 'react';
import { Placement } from '@floating-ui/core/src/types';

type VW = `${number}vw`;

type IState = {
  isMobile: boolean;
};

type IProps = {
  icon?: ReactNode;
  content?: ReactNode;
  placement?: Placement;
  wPadding?: number | VW;
  zIndex?: number;
  contentClassName?: string;
  overlayClassName?: string;
  stopClick?: boolean;
};

export class SldTips extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  stopClick(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    if (this.props.stopClick !== false) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  render() {
    return (
      <SldOverlay
        shiftPadding={this.props.wPadding}
        overlay={this.props.content}
        placement={this.props.placement || 'top'}
        zIndex={this.props.zIndex}
        contentClassName={this.props.contentClassName}
        overlayClassName={this.props.overlayClassName}
        useBorder={true}
      >
        <span onClick={this.stopClick.bind(this)}>{this.props.icon ? this.props.icon : <InfoCircleOutlined />}</span>
      </SldOverlay>
    );
  }
}
