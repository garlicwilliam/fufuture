import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import styles from './fix-width.module.less';
import * as css from 'csstype';

type IProps = {
  width: string;
  justify: css.Property.JustifyContent;
};
type IState = {
  isMobile: boolean;
};

export class FixWidth extends BaseStateComponent<IProps, IState> {
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
    return (
      <div
        className={styles.fixWidth}
        style={{ gridTemplateColumns: this.props.width, justifyContent: this.props.justify }}
      >
        <div>{this.props.children}</div>
      </div>
    );
  }
}
