import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './pending-holder.module.less';
import { styleMerge } from '../../../util/string';
import { LoadingOutlined } from '@ant-design/icons';

type IProps = {
  loading: boolean;
  height?: string | number;
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

  propsCssSize(val: number | string | undefined): string | undefined {
    return val ? (typeof val === 'number' ? val + 'px' : val) : undefined;
  }

  render() {
    const width = this.propsCssSize(this.props.width);
    const height = this.propsCssSize(this.props.height);
    const darkCss = this.props.dark === true ? styles.dark : '';

    return this.props.loading ? (
      this.props.useIcon ? (
        <LoadingOutlined />
      ) : (
        <div
          className={styleMerge(styles.animatedBackground, darkCss, 'placeholder')}
          style={{ height: height, width: width, lineHeight: 0 }}
        />
      )
    ) : (
      <>{this.props.children}</>
    );
  }
}
