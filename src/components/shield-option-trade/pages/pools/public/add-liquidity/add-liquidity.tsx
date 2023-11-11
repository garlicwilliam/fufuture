import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './add-liquidity.module.less';
import { fontCss } from '../../../../../i18n/font-switch';
import { I18n } from '../../../../../i18n/i18n';
import { AddPubLiquidityForm } from './add-form';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class AddPublicLiquidity extends BaseStateComponent<IProps, IState> {
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

    return (
      <div className={styleMr(styles.wrapperAddLiquidity)}>
        <div className={styleMr(styles.cardTitle, fontCss.bolder)}>
          <I18n id={'trade-liquidity-add'} />
        </div>

        <div className={styleMr(styles.cardContent)}>
          <AddPubLiquidityForm />
        </div>
      </div>
    );
  }
}
