import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './pending-holder.module.less';
import { styleMerge } from '../../../util/string';
import { LoadingOutlined } from '@ant-design/icons';

type IProps = {
  loading: boolean;
  height?: string;
  width?: string | number;
  dark?: boolean;
  useIcon?: boolean;
};
type IState = {};

export class PendingHolder extends BaseStateComponent<IProps, IState> {
  state: IState = {};

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidMount() {}

  render() {
    const width = this.props.width
      ? typeof this.props.width === 'number'
        ? this.props.width + 'px'
        : this.props.width
      : undefined;

    const darkCss = this.props.dark === true ? styles.dark : '';

    return this.props.loading ? (
      this.props.useIcon ? (
        <LoadingOutlined />
      ) : (
        <div
          className={styleMerge(styles.animatedBackground, darkCss, 'placeholder')}
          style={{ height: this.props.height, width: width, lineHeight: 0 }}
        />
      )
    ) : (
      <>{this.props.children}</>
    );
  }
}
