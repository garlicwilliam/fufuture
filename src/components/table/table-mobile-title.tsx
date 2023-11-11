import { BaseStateComponent } from '../../state-manager/base-state-component';
import { ReactNode } from 'react';

type IProps = {
  itemTop: ReactNode;
  itemBottom?: ReactNode;
  pullRight?: boolean;
};
type IState = {
  isMobile: boolean;
};

export class TableMobileTitle extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    return (
      <span
        style={{
          display: 'inline-block',
          width: '100%',
          whiteSpace: 'nowrap',
          fontSize: '12px',
          color: '#666666',
          textAlign: this.props.pullRight ? 'right' : 'left',
        }}
      >
        {this.props.itemTop} <br /> {this.props.itemBottom}
      </span>
    );
  }
}
