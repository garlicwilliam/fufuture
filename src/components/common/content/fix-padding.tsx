import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { Property } from 'csstype';

type IProps = {
  top: number;
  bottom: number;
  mobTop: number;
  mobBottom: number;

  flex?: boolean;
  justify?: Property.JustifyContent;
};
type IState = {
  isMobile: boolean;
};

export class FixPadding extends BaseStateComponent<IProps, IState> {
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
    const top = this.state.isMobile ? this.props.mobTop : this.props.top;
    const bot = this.state.isMobile ? this.props.mobBottom : this.props.bottom;
    const dis = this.props.flex ? 'flex' : 'block';
    const jst = this.props.justify ? this.props.justify : undefined;

    return (
      <div
        style={{
          paddingTop: top + 'px',
          paddingBottom: bot + 'px',
          display: dis,
          overflow: 'hidden',
          position: 'relative',
          justifyContent: jst,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
