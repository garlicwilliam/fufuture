import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './your-liquidity.module.less';
import { fontCss } from '../../../../../i18n/font-switch';
import { LiquidityCard } from './liquidity-card';
import { LiquiditySetting } from './liquidity-setting';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { I18n } from '../../../../../i18n/i18n';
import { AddPrivateLiquidity } from './add-liquidity';
import { WithdrawPrivateLiquidity } from './withdraw-liquidity';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { ShieldMakerPrivatePoolInfo } from '../../../../../../state-manager/state-types';
import { Visible } from '../../../../../builtin/hidden';
import { Empty } from 'antd';
import { ShieldLoading } from '../../../common/loading';
import { D } from '../../../../../../state-manager/database/database-state-parser';

type IState = {
  isMobile: boolean;
  liquidityList: ShieldMakerPrivatePoolInfo[] | undefined;
};
type IProps = {};

export class YourLiquidity extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    liquidityList: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    // this.registerState('liquidityList', S.Option.Pool.Maker.Liquidity.Private.List);
    this.registerState('liquidityList', D.Option.Maker.YourLiquidity);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onAdd() {
    P.Option.Pools.Private.Liquidity.Add.IsVisible.set(true);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <>
        <div className={styleMr(styles.wrapperYour)}>
          <div className={styleMr(styles.cardTitle, fontCss.bolder)}>
            <I18n id={'trade-liquidity-yours'} />
          </div>

          <div className={styleMr(styles.cardList)}>
            <Visible when={!this.state.liquidityList}>
              <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
                <ShieldLoading size={40} />
              </FixPadding>
            </Visible>

            <Visible when={!!this.state.liquidityList && this.state.liquidityList.length === 0}>
              <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
                <Empty />
              </FixPadding>
            </Visible>

            <Visible when={!!this.state.liquidityList && this.state.liquidityList.length > 0}>
              {this.state.liquidityList?.map((one, i) => {
                return <LiquidityCard key={i} poolInfo={one} />;
              })}
            </Visible>
          </div>

          <div className={styleMr(styles.actions)}>
            <FixPadding top={30} bottom={0} mobTop={16} mobBottom={0}>
              <SldButton
                size={'large'}
                type={'primary'}
                className={styleMr(styles.btn)}
                onClick={this.onAdd.bind(this)}
              >
                <I18n id={'trade-liquidity-add'} textUpper={'uppercase'} />
              </SldButton>
            </FixPadding>
          </div>
        </div>

        <LiquiditySetting />
        <AddPrivateLiquidity />
        <WithdrawPrivateLiquidity />
      </>
    );
  }
}
