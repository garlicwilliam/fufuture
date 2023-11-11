import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';

type IProps = {
  width: number;
  className?: string;
  pointTo?: 'left' | 'right' | 'top' | 'down';
};
type IState = {
  isMobile: boolean;
};

export class IconDropdown extends BaseStateComponent<IProps, IState> {
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
    const deg: number =
      this.props.pointTo === 'right'
        ? -90
        : this.props.pointTo === 'left'
        ? 90
        : this.props.pointTo === 'top'
        ? 180
        : 0;
    return (
      <span
        className={this.props.className}
        style={{
          display: 'inline-block',
          lineHeight: '0',
          transform: `rotate(${deg}deg)`,
          transitionDuration: '200ms',
        }}
      >
        <svg width={this.props.width + 'px'} viewBox="0 0 11 11" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="page-1" stroke="none" strokeWidth="1" fillRule="evenodd" fill="currentColor">
            <polygon id="rect" points="1 1.5 5.50681599 1.5 10 1.5 10 3.95184721 5.5 8.5 1 3.95184721" />
          </g>
        </svg>
      </span>
    );
  }
}
