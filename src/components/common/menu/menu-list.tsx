import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge, StyleMerger } from '../../../util/string';
import styles from './menu-list.module.less';
import React, { ReactNode } from 'react';
import { Resize } from '../utils/resize';
import { RouteKey } from '../../../constant/routes';
import { MenuNode, ShieldMenu } from './nav-menu';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { curTimestamp } from '../../../util/time';
import { LocationProps, withLocation } from '../utils/location-wrapper';
import { Visible } from '../../builtin/hidden';
import { SldOverlay } from '../overlay/overlay';
import { CloseOutlined, EllipsisOutlined, MenuOutlined } from '@ant-design/icons';
import { Placement } from '@floating-ui/core/src/types';

export type MenuOption = {
  router: RouteKey;
  content: ReactNode;
  url?: string;
  sub?: MenuOption[];
  overlay?: ReactNode;
  overlayPlace?: Placement;
  noLink?: boolean;
};

type IState = {
  isMobile: boolean;
  deskMenuWidth: number;
  hiddenMenus: RouteKey[]; // hidden menus
  ellipsisLeftPos: number | undefined;
  isVisible: boolean;
};

type IProps = {
  menus: MenuOption[];
  menuClassName?: string;
  menuListClassName?: string;

  overlayClassName?: string;
  overlayContentClassName?: string;

  deskOuterClassName?: string;
  mobileBtnClassName?: string;
} & LocationProps;

function optionIsActive(option: MenuOption, curRouter: RouteKey): boolean {
  return (
    option.router === curRouter ||
    curRouter.startsWith(option.router) ||
    !!option.sub?.some(one => optionIsActive(one, curRouter))
  );
}

function optionToNode(option: MenuOption, curRoute: RouteKey): MenuNode {
  return {
    content: option.content,
    router: option.router,
    url: option.url,
    isActive: optionIsActive(option, curRoute),
    children: option.sub?.map(one => optionToNode(one, curRoute)),
  };
}

export class MenuListImp extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    deskMenuWidth: 0,
    hiddenMenus: [],
    ellipsisLeftPos: undefined,
    isVisible: false,
  };

  private refreshEvent: Subject<number> = new Subject<number>();
  private hideState = new Set<RouteKey>();
  private menuLeftPos = new Map<RouteKey, number>();

  private domChangeCallback = (event?: any) => {
    this.refreshEvent.next(curTimestamp());
  };
  private observer = new MutationObserver(this.domChangeCallback);
  private container: HTMLDivElement | null = null;
  private registerListDom = (dom: HTMLDivElement | null) => {
    if (dom === null) {
      return;
    }

    if (dom !== this.container) {
      this.container = dom;
      this.observer.disconnect();

      if (this.container) {
        this.domChangeCallback();
        this.observer.observe(this.container, { attributes: true, childList: true, subtree: true });
      }
    }
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
    this.observer.disconnect();
    this.container = null;
    this.refreshEvent.complete();
  }

  onVisibleChange(isVisible: boolean) {
    this.updateState({ isVisible });
  }

  // on menu hide state change
  private onHideChange(key: RouteKey, hide: boolean, left: number): void {
    this.menuLeftPos.set(key, left);

    if (hide) {
      this.hideState.add(key);
    } else {
      this.hideState.delete(key);
    }

    const hides: RouteKey[] = Array.from(this.hideState).sort();
    const min: number | undefined = _.min(
      Array.from(this.hideState)
        .map(hide => this.menuLeftPos.get(hide))
        .filter(Boolean)
    );

    const updateState: Partial<IState> = {};

    if (!_.isEqual(this.state.ellipsisLeftPos, min)) {
      updateState.ellipsisLeftPos = min;
    }

    if (!_.isEqual(this.state.hiddenMenus, hides)) {
      updateState.hiddenMenus = hides;
    }

    this.updateState(updateState);
  }

  private genOverlay(styleMr: StyleMerger, routeKey: RouteKey, hides: RouteKey[] = []): ReactNode {
    const onOverlay: boolean = hides.length > 0;
    const hideRoutes = new Set<RouteKey>(hides);

    return (
      <div className={styleMr(styles.menuOverlayList, 'sld-menu-list-in-overlay', this.props.menuListClassName)}>
        {this.props.menus.map((one: MenuOption, index: number) => {
          const isLast: boolean = index + 1 === this.props.menus.length;

          return (
            <Visible key={index} when={this.state.isMobile || hideRoutes.has(one.router)}>
              <ShieldMenu
                key={index}
                isActive={optionIsActive(one, routeKey)}
                content={one.content}
                router={one.router}
                url={one.url}
                stopLink={one.noLink}
                onOverlay={onOverlay}
                className={styleMr(this.props.menuClassName)}
                children={one.sub?.map(one => optionToNode(one, routeKey))}
                isLastOne={isLast}
              />
            </Visible>
          );
        })}
      </div>
    );
  }

  private genDesk(styleMr: StyleMerger, routeKey: RouteKey): ReactNode {
    return (
      <div className={styleMr(styles.outer, 'sld-menu-list-outer-desk', this.props.deskOuterClassName)}>
        <div className={styleMr(styles.menuListContainer, 'sld-menu-list-wrapper')}>
          <Resize
            onResize={w => {
              this.updateState({ deskMenuWidth: Math.ceil(w) });
            }}
          >
            <div
              className={styleMr(styles.menuList, 'sld-menu-list', this.props.menuListClassName)}
              ref={dom => this.registerListDom(dom)}
            >
              {this.props.menus.map((one: MenuOption, index: number) => {
                return (
                  <ShieldMenu
                    key={index}
                    isActive={optionIsActive(one, routeKey)}
                    content={one.content}
                    router={one.router}
                    url={one.url}
                    stopLink={one.noLink}
                    children={one.sub?.map(one => optionToNode(one, routeKey))}
                    childrenOverlay={one.overlay}
                    childrenOverlayPlace={one.overlayPlace}
                    outerWidth={this.state.deskMenuWidth}
                    hideStateChange={this.onHideChange.bind(this)}
                    refreshEvent={this.refreshEvent}
                    className={this.props.menuClassName}
                  />
                );
              })}
            </div>
          </Resize>
        </div>

        <div className={styleMr(styles.ellipsis, 'sld-menu-list-ellipsis')}>
          <Visible when={this.state.hiddenMenus.length > 0}>
            <SldOverlay
              useArrow={false}
              overlay={this.genOverlay(styleMr, routeKey, this.state.hiddenMenus)}
              placement={'bottom-end'}
              offset={4}
              overlayClassName={styleMerge('sld-menu-list-ellipsis-overlay', this.props.overlayClassName)}
              contentClassName={styleMerge(
                'sld-menu-list-ellipsis-overlay-content',
                this.props.overlayContentClassName
              )}
              zIndex={1100}
            >
              <div
                className={styleMr(styles.ellipsisBtn, 'sld-menu-list-ellipsis-btn')}
                style={{ left: -(this.state.deskMenuWidth - (this.state.ellipsisLeftPos || 0)) + 'px' }}
              >
                <EllipsisOutlined />
              </div>
            </SldOverlay>
          </Visible>
        </div>
      </div>
    );
  }

  private genMobile(styleMr: StyleMerger, routeKey: RouteKey) {
    return (
      <SldOverlay
        placement={'bottom-end'}
        overlay={this.genOverlay(styleMr, routeKey)}
        useArrow={false}
        offset={2}
        overlayClassName={styleMerge('sld-menu-list-mobile-overlay', this.props.overlayClassName)}
        contentClassName={styleMerge('sld-menu-list-mobile-overlay-content', this.props.overlayContentClassName)}
        visibleChange={this.onVisibleChange.bind(this)}
        zIndex={1100}
      >
        <div
          className={styleMr(
            styles.mobileDropdownBtn,
            'sld-menu-list-mobile',
            'sld-menu-list-mobile-trigger',
            this.props.mobileBtnClassName
          )}
        >
          {this.state.isVisible ? <CloseOutlined /> : <MenuOutlined />}
        </div>
      </SldOverlay>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? 'mobile' : '';
    const styleMr = bindStyleMerger(mobileCss);
    const routeKey: RouteKey = _.trim(this.props.location.pathname, '/') as RouteKey;

    return this.state.isMobile ? this.genMobile(styleMr, routeKey) : this.genDesk(styleMr, routeKey);
  }
}

export const ShieldMenuList = withLocation(MenuListImp);
