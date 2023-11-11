import { BaseStateComponent } from '../../state-manager/base-state-component';
import { P } from '../../state-manager/page/page-state-parser';
import { appendBodyService } from './append-body.service';

type IState = {
  isMobile: boolean;
  containers: [string, JSX.Element][];
};
type IProps = {};

export class AppendBodyContainer extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    containers: [],
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('containers', appendBodyService.watchElements());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    return (
      <div id={'append-body-containers'}>
        {this.state.containers.map((one: [string, JSX.Element]) => {
          return (
            <div key={one[0]} id={one[0]}>
              {one[1]}
            </div>
          );
        })}
      </div>
    );
  }
}
