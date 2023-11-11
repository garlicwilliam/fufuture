import { BaseStateComponent } from '../../state-manager/base-state-component';
import { PendingHolder } from '../common/progress/pending-holder';
import styles from './table-loading.module.less';
import { styleMerge } from '../../util/string';

type IProps = {
  isDark?: boolean;
};
type IState = {};

export class TableLoading extends BaseStateComponent<IProps, IState> {
  state = {};

  render() {
    return (
      <>
        <div className={styleMerge(styles.wrapper)}>
          <div className={styleMerge(styles.loadingItem)}>
            <PendingHolder loading={true} dark={this.props.isDark}>
              &nbsp;
            </PendingHolder>
          </div>
          <div className={styleMerge(styles.loadingItem)}>
            <PendingHolder loading={true} dark={this.props.isDark}>
              &nbsp;
            </PendingHolder>
          </div>
        </div>
      </>
    );
  }
}
