import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './index-underlying-icon.module.less';
import { IndexUnderlyingAssetsIcon } from '../../const/imgs';
import { ShieldUnderlyingType } from '../../../../state-manager/state-types';

type IState = {
  isMobile: boolean;
};
type IProps = {
  size: number;
  indexUnderlying: ShieldUnderlyingType;
};

function px(num: number): string {
  return num + 'px';
}

export class IndexUnderlyingIcon extends BaseStateComponent<IProps, IState> {
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
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);
    const iconUrl = IndexUnderlyingAssetsIcon[this.props.indexUnderlying];

    return (
      <div className={styleMr(styles.indexIcon)} style={{ width: px(this.props.size), height: px(this.props.size) }}>
        <img src={iconUrl} alt={''} width={this.props.size} height={this.props.size} />
      </div>
    );
  }
}
