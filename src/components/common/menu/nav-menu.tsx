import React, { ReactNode } from 'react';
import { RouteKey } from '../../../constant/routes';
import { combineLatest, NEVER, Subject } from 'rxjs';
import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { tap } from 'rxjs/operators';
import { bindStyleMerger, cssPick, StyleMerger } from '../../../util/string';
import { Link } from 'react-router-dom';
import { fontCss } from '../../i18n/font-switch';
import styles from './nav-menu.module.less';
import { SldOverlay } from '../overlay/overlay';
import { IconDropdown } from '../icon/dropdown';
import { Visible } from '../../builtin/hidden';
import { Placement } from '@floating-ui/core';

export type MenuNode = {
  content: ReactNode;
  router: RouteKey;
  isActive: boolean;
  url?: string;
  stopLink?: boolean;
  children?: MenuNode[];
};

type MState = {
  isMobile: boolean;
  width: number;
  left: number;
  isHide: boolean;
  isDropdown: boolean;
};

type MProps = MenuNode & {
  childrenOverlay?: ReactNode;
  childrenOverlayPlace?: Placement;
  onOverlay?: boolean;
  outerWidth?: number;
  hideStateChange?: (key: RouteKey, isHide: boolean, left: number) => void;
  refreshEvent?: Subject<number>;
  className?: string;
  isLastOne?: boolean;
};

export class ShieldMenu extends BaseStateComponent<MProps, MState> {
  state: MState = {
    isMobile: P.Layout.IsMobile.get(),
    width: 0,
    left: 0,
    isHide: false,
    isDropdown: false,
  };

  private callback = () => {
    if (!this.boxDom) {
      return;
    }

    if (this.boxDom && (this.state.left !== this.boxDom.offsetLeft || this.state.width !== this.boxDom.offsetWidth)) {
      this.updateState({ left: this.boxDom.offsetLeft, width: this.boxDom.offsetWidth });
    }
  };
  private observer = new MutationObserver(this.callback);
  private boxDom: HTMLDivElement | null = null;

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.updateIsHide();
    this.emitHideState();

    if (this.props.refreshEvent) {
      this.watchRefreshEvent(this.props.refreshEvent);
    }
  }

  componentWillUnmount() {
    this.destroyState();
    this.observer.disconnect();
    this.boxDom = null;
  }

  componentDidUpdate(prevProps: Readonly<MProps>, prevState: Readonly<MState>, snapshot?: any) {
    if (this.props.refreshEvent !== prevProps.refreshEvent) {
      this.watchRefreshEvent(this.props.refreshEvent);
    }

    if (
      this.props.onOverlay !== prevProps.onOverlay ||
      this.state.isMobile !== prevState.isMobile ||
      this.props.outerWidth !== prevProps.outerWidth ||
      this.state.left !== prevState.left ||
      this.state.width !== prevState.width
    ) {
      this.updateIsHide();
    }
  }

  private updateIsHide() {
    const isHide =
      !this.props.onOverlay &&
      !this.state.isMobile &&
      (this.props.outerWidth || 0) < this.state.left + this.state.width;

    this.updateState({ isHide });
  }

  private watchRefreshEvent(events: Subject<number> | undefined) {
    const trigger$ = events
      ? events.pipe(
          tap((time: number) => {
            this.callback();
          })
        )
      : NEVER;

    this.subWithId(trigger$, 'events');
  }

  private emitHideState() {
    const emitIsHide$ = combineLatest([this.watchStateChange('left'), this.watchStateChange('isHide')]).pipe(
      tap(([left, isHide]: [number, boolean]) => {
        if (this.props.hideStateChange) {
          this.props.hideStateChange(this.props.router, isHide, left);
        }
      })
    );

    this.sub(emitIsHide$);
  }

  private registerBox(dom: HTMLDivElement | null) {
    if (!dom) {
      return;
    }

    if (this.boxDom !== dom) {
      this.boxDom = dom;
      this.observer.disconnect();

      if (this.boxDom) {
        this.observer.observe(this.boxDom, { attributes: true, childList: true, subtree: true });
        this.callback();
      }
    }
  }

  private genDesktopDom(styleMr: StyleMerger): ReactNode {
    const hasChildOverlay: boolean = !!this.props.childrenOverlay;
    const link: any = this.props.url ? this.props.url : this.props.router;
    const useA: boolean = !!this.props.url;

    const coreDom = (
      <div
        ref={dom => this.registerBox(dom)}
        style={{ whiteSpace: 'nowrap' }}
        className={styleMr(
          'sld-menu',
          cssPick(!this.props.isActive, fontCss.medium),
          cssPick(this.props.isActive, 'sld-menu-active', fontCss.bold)
        )}
      >
        {this.props.content}
        <Visible when={hasChildOverlay}>
          <span style={{ width: '6px' }} />
          <IconDropdown width={10} pointTo={this.state.isDropdown ? 'top' : 'down'} />
        </Visible>
      </div>
    );

    const menu = this.props.stopLink ? (
      <div className={styleMr('sld-menu-link', cssPick(this.state.isHide, styles.linkHide))}>{coreDom}</div>
    ) : useA ? (
      <a href={link} className={styleMr('sld-menu-link', cssPick(this.state.isHide, styles.linkHide))}>
        {coreDom}
      </a>
    ) : (
      <Link to={link} className={styleMr('sld-menu-link', cssPick(this.state.isHide, styles.linkHide))}>
        {coreDom}
      </Link>
    );

    const menuDom: ReactNode = this.props.className ? (
      <div className={styleMr(this.props.className)}>{menu}</div>
    ) : (
      menu
    );

    const node = hasChildOverlay ? (
      <SldOverlay
        useArrow={false}
        overlay={this.props.childrenOverlay}
        placement={this.props.childrenOverlayPlace || 'bottom-end'}
        offset={4}
        visibleChange={(isVisible: boolean) => {
          this.updateState({ isDropdown: isVisible });
        }}
        contentClassName={'sld-menu-sub-overlay'}
      >
        {menuDom}
      </SldOverlay>
    ) : (
      menuDom
    );

    return node;
  }

  private genMenuDomOnOverlay(
    styleMr: StyleMerger,
    node: MenuNode,
    op?: { key?: number | string; isLast?: boolean }
  ): ReactNode {
    const useA: boolean = !!this.props.url;

    const coreDom = (
      <div
        style={{ whiteSpace: 'nowrap' }}
        className={styleMr(
          'sld-menu',
          cssPick(op?.isLast, 'last'),
          cssPick(node.isActive, 'sld-menu-active', fontCss.bold),
          cssPick(!node.isActive, fontCss.medium)
        )}
      >
        {node.content}
      </div>
    );

    const link: string = node.url ? node.url : node.router;
    const menu = node.stopLink ? (
      coreDom
    ) : useA ? (
      <a href={link} className={styleMr('sld-menu-link')}>
        {coreDom}
      </a>
    ) : (
      <Link to={link} className={styleMr('sld-menu-link')}>
        {coreDom}
      </Link>
    );

    const menuDom: ReactNode = this.props.className ? (
      <div className={styleMr(this.props.className)}>{menu}</div>
    ) : (
      menu
    );

    return op?.key ? <React.Fragment key={op.key}>{menuDom}</React.Fragment> : menuDom;
  }

  private genSubGroupsOnOverlay(styleMr: StyleMerger, nodes: MenuNode[]): ReactNode {
    return (
      <div className={styleMr('sld-menu-list-mobile-sub-group')}>
        {nodes.map((node: MenuNode, index: number) => {
          const isLast = index + 1 === nodes.length && this.props.isLastOne;
          return this.genMenuDomOnOverlay(styleMr, node, { key: 'sub_menu_' + index.toString(), isLast: isLast });
        })}
      </div>
    );
  }

  private genMobileDom(styleMr: StyleMerger, hasChildren: boolean): ReactNode {
    if (hasChildren && !!this.props.children) {
      return (
        <>
          {this.genMenuDomOnOverlay(styleMr, this.props, { key: 'main_of_sub_menu' })}
          {this.genSubGroupsOnOverlay(styleMr, this.props.children)}
        </>
      );
    } else {
      return this.genMenuDomOnOverlay(styleMr, this.props, { isLast: this.props.isLastOne });
    }
  }

  render() {
    const isInMobileCard: boolean = this.state.isMobile || !!this.props.onOverlay;
    const mobileCss: string = isInMobileCard ? 'mobile' : '';
    const styleMr = bindStyleMerger(mobileCss);

    return isInMobileCard
      ? this.genMobileDom(styleMr, (this.props.children?.length || 0) > 0)
      : this.genDesktopDom(styleMr);
  }
}
