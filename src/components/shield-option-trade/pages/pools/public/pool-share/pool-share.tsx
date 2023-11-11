import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './pool-share.module.less';
import { fontCss } from '../../../../../i18n/font-switch';
import { PoolItem } from './pool-item';
import { ShieldMakerPublicPoolShare } from '../../../../../../state-manager/state-types';
import { WithdrawPublic } from './withdraw-public';
import { I18n } from '../../../../../i18n/i18n';
import { Visible } from '../../../../../builtin/hidden';
import { ShieldLoading } from '../../../common/loading';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { Empty } from 'antd';
import { D } from '../../../../../../state-manager/database/database-state-parser';

type IState = {
  isMobile: boolean;
  poolList: ShieldMakerPublicPoolShare[] | undefined;
};
type IProps = {};

export class PoolShare extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    poolList: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('poolList', D.Option.Maker.YourShareInPools);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperShare)}>
        <div className={styleMr(styles.cardTitle, fontCss.bolder)}>
          <I18n id={'trade-liquidity-share'} />
        </div>

        <div className={styleMr(styles.poolList)}>
          <Visible when={this.state.poolList === undefined}>
            <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
              <ShieldLoading size={40} />
            </FixPadding>
          </Visible>

          <Visible when={!!this.state.poolList && this.state.poolList.length > 0}>
            {this.state.poolList?.map((one: ShieldMakerPublicPoolShare, index: number) => {
              return <PoolItem key={index} pubShare={one} />;
            })}
          </Visible>

          <Visible when={!!this.state.poolList && this.state.poolList.length === 0}>
            <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
              <Empty />
            </FixPadding>
          </Visible>
        </div>

        <WithdrawPublic />
      </div>
    );
  }
}
