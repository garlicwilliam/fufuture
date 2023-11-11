import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import styles from './option-menu-list.module.less';
import { MenuOption, ShieldMenuList } from '../../../common/menu/menu-list';
import { RouteKey } from '../../../../constant/routes';
import { I18n } from '../../../i18n/i18n';
import { LocationProps, withLocation } from '../../../common/utils/location-wrapper';

type IState = {
  isMobile: boolean;
};

type IProps = {
  isDark?: boolean;
  isHome?: boolean;
} & LocationProps;

function menuOptions(pathname: string, isHome: boolean): MenuOption[] {
  const appUrl = 'https://app.shieldex.io/u/';

  return [
    {
      router: RouteKey.trade,
      content: <I18n id={'trade-menu-trade'} />,
      url: isHome ? appUrl + RouteKey.trade : undefined,
    },
    {
      router: RouteKey.pools,
      content: <I18n id={'trade-menu-pool'} />,
      url: isHome ? appUrl + RouteKey.pools : undefined,
    },
    // {
    //   router: RouteKey.swapBurn,
    //   content: <I18n id={'menu-swap-burn'} />,
    //   url: isHome ? appUrl + RouteKey.swapBurn : undefined,
    // },
    {
      router: RouteKey.referral,
      content: <I18n id={'trade-menu-referral'} />,
      url: isHome ? appUrl + RouteKey.referral : undefined,
    },
  ];
}

export class OptionMenuListImp extends BaseStateComponent<IProps, IState> {
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
      <ShieldMenuList
        menus={menuOptions(this.props.location.pathname, !!this.props.isHome)}
        mobileBtnClassName={this.props.isDark ? styles.mobileBtnDark : styles.mobileBtnLight}
        deskOuterClassName={this.props.isDark ? styles.dark : styles.light}
        overlayContentClassName={styles.menuOverlayContent}
      />
    );
  }
}

export const OptionMenuList = withLocation(OptionMenuListImp);
