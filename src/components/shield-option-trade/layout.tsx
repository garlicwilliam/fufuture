import { BaseStateComponent } from '../../state-manager/base-state-component';
import { P } from '../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../util/string';
import styles from './layout.module.less';
import { EmptyProps, LocationProps, withLocation } from '../common/utils/location-wrapper';
import { Outlet } from 'react-router-dom';
import { AppendBodyContainer } from '../../services/append-body/append';
import React from 'react';
import { AppHead } from './pages/head/head';
import { ConnectWallet } from '../connect-wallet/connect-wallet';
import { Visible } from '../builtin/hidden';
import { MobileFoot } from './pages/head/mobile-foot';
import { fontCss } from '../i18n/font-switch';
import { RouteKey } from '../../constant/routes';
import {ResultMask} from "../common/overlay/result-mask";

type IState = {
  isMobile: boolean;
  isLightHead: boolean;
};
type IProps = EmptyProps & LocationProps;

class ShieldOptionAppImp extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isLightHead: false,
  };

  private scrollCallback = () => {
    const distance = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    this.updateState({ isLightHead: distance > 70 });
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    window.addEventListener('scroll', this.scrollCallback);
  }

  componentWillUnmount() {
    this.destroyState();
    window.removeEventListener('scroll', this.scrollCallback);
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    this.updateRouteInfo();
  }

  updateRouteInfo() {
    this.setLocation(this.props.location);
    this.setNavParam(this.props.param);
    this.setNavigation(this.props.nav);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const isPoster = this.props.location.pathname.indexOf(RouteKey.poster) >= 0;

    return (
      <>
        <div className={styleMr(styles.wrapperLayout, fontCss.mediumLatin)}>
          <AppHead />

          <div>
            <Outlet />
          </div>

          <ConnectWallet manualPopup={isPoster} />

          <Visible when={this.state.isMobile}>
            <MobileFoot />
          </Visible>
        </div>

        <AppendBodyContainer />
        <ResultMask />
      </>
    );
  }
}

export const ShieldOptionTrade = withLocation(ShieldOptionAppImp);
