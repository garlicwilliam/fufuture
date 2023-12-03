import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import { SldSelect, SldSelectOption } from '../../../common/selects/select';
import { iconSize, IndexUnderlyingAssetsIcon } from '../../const/imgs';
import { fontCss } from '../../../i18n/font-switch';
import styles from './assets-select.module.less';
import { TokenIndex } from './token-index';

import {ShieldUnderlyingType} from "../../../../state-manager/state-types";

type IState = {
  isMobile: boolean;
};
type IProps = {
  onSelect?: (assets: ShieldUnderlyingType) => void;
  curSelect?: ShieldUnderlyingType;
};

export class AssetsSelect extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onSelectAsset(option: SldSelectOption) {
    if (this.props.onSelect) {
      this.props.onSelect(option.value as ShieldUnderlyingType);
    }
  }

  private genAssetsOptions(): SldSelectOption[] {
    return Object.values(ShieldUnderlyingType).map((indexUnderlying: string) => {
      return {
        label: (
          <div className={styles.assetsItem}>
            <img src={IndexUnderlyingAssetsIcon[indexUnderlying]} alt={''} width={iconSize} />
            <div className={fontCss.bold}>
              <TokenIndex token={indexUnderlying} />
            </div>
          </div>
        ),
        value: indexUnderlying,
      };
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <SldSelect
        banDefaultStyle={true}
        parentClassName={styles.selectBtn}
        dropdownClassName={styles.selectBtnDropdown}
        dropdownSize={10}
        options={this.genAssetsOptions()}
        zIndex={1100}
        onChangeSelect={(op: SldSelectOption) => this.onSelectAsset(op)}
        curSelected={this.props.curSelect}
      />
    );
  }
}
