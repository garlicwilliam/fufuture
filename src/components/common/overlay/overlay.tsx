import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import React, { Component, CSSProperties, ReactNode } from 'react';
import { computePosition, arrow } from '@floating-ui/dom';
import { ComputePositionReturn, Side, Placement } from '@floating-ui/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  switchMap,
  from,
  Subject,
  asyncScheduler,
  of,
  fromEvent,
} from 'rxjs';
import { delay, distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import styles from './overlay.module.less';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { cssPick, styleMerge } from '../../../util/string';
import { AppendBody } from './append-body';
import { flip, offset, Padding, shift } from '@floating-ui/react-dom';
import { fontCss } from '../../i18n/font-switch';

const attrNameSldOverlay = 'data-sld-overlay';
const attrNameSldTrigger = 'data-sld-trigger';
const attrNameSldRole = 'data-sld-role';

export type TriggerEvent = {
  action: 'show' | 'hide';
  date: Date;
};
type VW = `${number}vw`;
type ScrollEvent = {
  isScrolling: boolean;
  date: Date;
};
type IProps = {
  overlay: ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
  placement: Placement;
  offset?: number;
  shiftPadding?: Padding | VW;
  useArrow?: boolean;
  useBorder?: boolean;
  trigger?: 'hover' | 'click' | 'none';
  forceTriggerEvent?: TriggerEvent;
  debug?: boolean;
  visibleChange?: (isVisible: boolean) => void;
  positionFixed?: boolean;
  scrollAction?: 'hide' | 'follow';
  isClickHide?: boolean;
  zIndex?: number;
  visible?: boolean;
  useMask?: boolean;
  triggerCloseable?: boolean;
};
type IState = {
  isMobile: boolean;
  position: ComputePositionReturn | null;

  lastForceTrigger: BehaviorSubject<TriggerEvent | null>;
  visibleSubject: BehaviorSubject<boolean>;

  visibleStyle: 'hidden' | 'visible';
  displayStyle: 'none' | 'block';
  animationPlay: 'paused' | 'running';
  positionUpdated: boolean;
};

class Wrapper extends Component<any, any> {
  element(): Element {
    return ReactDOM.findDOMNode(this) as Element;
  }

  render() {
    return <>{this.props.children}</>;
  }
}

class Refer<T> implements React.RefObject<T> {
  private curRef: BehaviorSubject<T | null> = new BehaviorSubject<T | null>(null);
  private isDebug: boolean = false;

  public set current(ref: T | null) {
    if (this.isDebug) {
      console.log('set ref', ref);
    }

    if (ref === null || ref === undefined) {
      return;
    }

    if (this.curRef.getValue() === ref) {
      return;
    }

    this.curRef.next(ref);
  }

  public get current(): T | null {
    return this.curRef.getValue();
  }

  public refChanged(): Observable<T> {
    return this.curRef.pipe(
      filter(one => one !== null),
      map(one => one as T)
    );
  }

  public destroy() {
    this.curRef.next(null);
    this.curRef.complete();
  }

  public debug(): this {
    this.isDebug = true;
    return this;
  }
}

function createRef<T>(): Refer<T> {
  const refObject = new Refer<T>();
  Object.seal(refObject);

  return refObject;
}

function findOverlay(current: HTMLElement, id: string): boolean {
  const overlayId: string | null = current.getAttribute(attrNameSldOverlay);
  if (overlayId === id) {
    return true;
  }

  const parent: HTMLElement | null = current.parentElement;
  if (parent) {
    return findOverlay(parent, id);
  } else {
    return false;
  }
}

function inAnyOverlay(target: HTMLElement): string | null {
  const overlayId: string | null = target.getAttribute(attrNameSldOverlay);
  if (overlayId === null) {
    const parent: HTMLElement | null = target.parentElement;
    if (parent) {
      return inAnyOverlay(parent);
    } else {
      return null;
    }
  }

  return overlayId;
}

function findReference(current: HTMLElement, id: string): boolean {
  const triggerId: string | null = current.getAttribute(attrNameSldTrigger);
  if (triggerId === id) {
    return true;
  }

  const parent: HTMLElement | null = current.parentElement;
  if (parent) {
    return findReference(parent, id);
  } else {
    return false;
  }
}

function isChildrenOfParent(childId: string, parentId: string): boolean {
  if (childId === parentId) {
    return true;
  }

  const childOverlay: SldOverlay | undefined = SldOverlay.SldOverlayInstances.get(childId);
  if (childOverlay && childOverlay.parentOverlayId) {
    return isChildrenOfParent(childOverlay.parentOverlayId, parentId);
  } else {
    return false;
  }
}

/**
 * Overlay Component
 */
export class SldOverlay extends BaseStateComponent<IProps, IState> {
  public static SldOverlayInstances = new Map<string, SldOverlay>();

  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    position: null,

    visibleSubject: new BehaviorSubject<boolean>(false),
    lastForceTrigger: new BehaviorSubject<TriggerEvent | null>(null),

    visibleStyle: 'hidden',
    displayStyle: 'none',
    animationPlay: 'paused',
    positionUpdated: false,
  };

  public id: string = Math.ceil(Math.random() * 10000000000).toString();
  public parentOverlayId: string | null = null;

  private updatePosEvent: Subject<any> = new Subject();
  private mouseOverState = {
    subFloatings: new BehaviorSubject<Set<string>>(new Set<string>()),
    floating: new BehaviorSubject<boolean>(false),
    reference: new BehaviorSubject<boolean>(false),
    isOverAny: new BehaviorSubject<boolean>(false),
  };
  private mouseClickReferenceEvent: Subject<any> = new Subject();
  private mouseClickFloatingEvent: Subject<any> = new Subject();
  private isScrolling: BehaviorSubject<ScrollEvent> = new BehaviorSubject<ScrollEvent>({
    isScrolling: false,
    date: new Date(),
  });

  private resizeCallback = () => {
    if (this.isCurrentVisible()) {
      asyncScheduler.schedule(() => {
        this.updatePosEvent.next(true);
      });
    }
  };

  private scrollCallback = () => {
    this.isScrolling.next({ isScrolling: true, date: new Date() });

    const timeoutDuration = 500;

    asyncScheduler.schedule(() => {
      const lastEvent: ScrollEvent = this.isScrolling.getValue();
      const deltaTime = new Date().getTime() - lastEvent.date.getTime();
      const isTimeout: boolean = lastEvent.isScrolling && deltaTime >= timeoutDuration;

      if (isTimeout) {
        this.isScrolling.next({ isScrolling: false, date: new Date() });
        this.updatePosEvent.next(true);
      }
    }, timeoutDuration + 50);

    asyncScheduler.schedule(() => {
      if (this.isCurrentVisible()) {
        if (this.props.scrollAction === 'hide') {
          this.state.lastForceTrigger.next({ action: 'hide', date: new Date() });
        } else {
          this.updatePosEvent.next(true);
        }
      }
    });
  };

  private referenceWrapperRef: Refer<Wrapper> = createRef<Wrapper>();
  private referenceEl: HTMLElement | null = null;
  private referenceObserver: ResizeObserver = new ResizeObserver(this.resizeCallback);

  private floatingRef: Refer<HTMLDivElement> = createRef<HTMLDivElement>();
  private floatingObserver: null | MutationObserver = null;
  private arrowRef: Refer<any> = createRef();
  private fixedStyleCss: CSSProperties | null = null;

  private isCurrentVisible(): boolean {
    return this.state.visibleSubject.getValue();
  }

  private visibleCallback = () => {
    if (this.props.visible === false) {
      return;
    }

    if (!this.state.visibleSubject.getValue()) {
      this.state.visibleSubject.next(true);
    }
  };

  private hiddenCallback = () => {
    if (this.props.visible === true) {
      return;
    }

    this.state.visibleSubject.next(false);
    this.updateState({ visibleStyle: 'hidden', displayStyle: 'none', animationPlay: 'paused' });
  };

  private mergeVisibleTrueStyles(): Observable<Partial<IState>> {
    return this.state.visibleSubject.pipe(
      distinctUntilChanged(),
      filter(Boolean),
      switchMap(() => {
        return this.watchStateChange('positionUpdated').pipe(filter((posUpdated: boolean) => this.isCurrentVisible()));
      }),
      map((updated: boolean): Partial<IState> => {
        const state: Partial<IState> = updated
          ? { displayStyle: 'block', animationPlay: 'running', visibleStyle: 'visible' }
          : { displayStyle: 'block', visibleStyle: 'hidden' };

        return state;
      }),
      filter((newState: Partial<IState>) => {
        return this.state.displayStyle !== newState.displayStyle || this.state.visibleStyle !== newState.visibleStyle;
      })
    );
  }

  private floatingOverCallback = () => {
    this.mouseOverState.floating.next(true);
  };
  private floatingLeaveCallback = () => {
    this.mouseOverState.floating.next(false);
  };
  private floatingClickCallback = (event: MouseEvent) => {
    this.mouseClickFloatingEvent.next(event);
  };
  private referenceOverCallback = () => {
    this.mouseOverState.reference.next(true);
  };
  private referenceLeaveCallback = () => {
    this.mouseOverState.reference.next(false);
  };
  private referenceClickCallback = (event: MouseEvent) => {
    this.mouseClickReferenceEvent.next(event);
  };
  public subFloatingOverCallback = (overlayId: string) => {
    const ids = this.mouseOverState.subFloatings.getValue();
    ids.add(overlayId);
    this.mouseOverState.subFloatings.next(ids);
  };
  public subFloatingLeaveCallback = (overlayId: string) => {
    const ids = this.mouseOverState.subFloatings.getValue();
    ids.delete(overlayId);
    this.mouseOverState.subFloatings.next(ids);
  };

  private dealWithPropsForceTrigger = () => {
    if (this.props.forceTriggerEvent) {
      this.state.lastForceTrigger.next(this.props.forceTriggerEvent);
    }
  };

  private dealWithPropsVisible = () => {
    if (this.props.visible) {
      this.visibleCallback();
    } else {
      this.hiddenCallback();
    }
  };

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    // for props.forceTriggerEvent
    if (
      prevProps.forceTriggerEvent?.date.getTime() !== this.props.forceTriggerEvent?.date.getTime() &&
      !!this.props.forceTriggerEvent
    ) {
      this.dealWithPropsForceTrigger();
    }

    // for props.visible
    if (prevProps.visible !== this.props.visible) {
      this.dealWithPropsVisible();
    }
  }

  componentDidMount() {
    SldOverlay.SldOverlayInstances.set(this.id, this);

    this.registerIsMobile('isMobile');
    this.registerMultiState(this.mergeElementsPosition());
    this.registerObservable('positionUpdated', this.mergePositionUpdated());
    this.registerMultiState(this.mergeVisibleTrueStyles());

    window.addEventListener('resize', this.resizeCallback);
    window.addEventListener('scroll', this.scrollCallback);

    this.sub(this.watchIsMouseOver());
    this.sub(this.watchHoverEvent());
    this.sub(this.watchReferenceClickEvent());
    this.sub(this.watchDocumentClickEvent());
    // this.sub(this.watchVisibleChange());
    this.sub(this.watchForceTrigger());
    this.sub(this.noticeParentOverlay());
    this.sub(this.emitState());

    if (this.props.forceTriggerEvent) {
      this.dealWithPropsForceTrigger();
    }

    if (this.props.visible !== undefined) {
      this.dealWithPropsVisible();
    }
  }

  componentWillUnmount() {
    SldOverlay.SldOverlayInstances.delete(this.id);

    this.destroyState();
    this.state.lastForceTrigger.complete();
    this.state.visibleSubject.complete();
    this.mouseOverState.floating.complete();
    this.mouseOverState.reference.complete();
    this.mouseOverState.subFloatings.complete();
    this.mouseOverState.isOverAny.complete();
    this.mouseClickReferenceEvent.complete();
    this.updatePosEvent.complete();
    this.isScrolling.complete();

    if (this.referenceEl) {
      this.delReferenceListener(this.referenceEl);
      this.referenceEl = null;
    }

    if (this.floatingRef.current) {
      this.delFloatingListener(this.floatingRef.current);
    }

    window.removeEventListener('resize', this.resizeCallback);
    window.removeEventListener('scroll', this.scrollCallback);

    this.referenceWrapperRef.destroy();
    this.floatingRef.destroy();
    this.arrowRef.destroy();
  }

  triggerType(): 'hover' | 'click' {
    const isHover = (this.props.trigger === 'hover' || this.props.trigger === undefined) && !this.state.isMobile;

    return isHover ? 'hover' : 'click';
  }

  watchForceTrigger(): Observable<TriggerEvent> {
    return this.state.lastForceTrigger.pipe(
      filter(one => one !== null),
      map(one => one as TriggerEvent),
      tap(event => {
        if (event?.action === 'hide') {
          this.hiddenCallback();
        } else {
          this.visibleCallback();
        }
      })
    );
  }

  watchIsMouseOver(): Observable<boolean> {
    const isSubFloating$: Observable<boolean> = this.mouseOverState.subFloatings.pipe(
      map(ids => {
        return ids.size > 0;
      })
    );

    return combineLatest([this.mouseOverState.reference, this.mouseOverState.floating, isSubFloating$]).pipe(
      map(([onReference, onFloating, onSubFloating]) => {
        return onReference || onFloating || onSubFloating;
      }),
      tap((isMouseOver: boolean) => {
        this.mouseOverState.isOverAny.next(isMouseOver);
      })
    );
  }

  watchHoverEvent(): Observable<boolean> {
    return this.mouseOverState.isOverAny.pipe(
      filter(() => this.triggerType() === 'hover'),
      switchMap((isVisible: boolean) => {
        if (isVisible) {
          return of(isVisible);
        } else {
          return of(isVisible).pipe(delay(100));
        }
      }),
      tap((isVisible: boolean) => {
        if (isVisible) {
          this.visibleCallback();
        } else {
          this.hiddenCallback();
        }
      })
    );
  }

  watchReferenceClickEvent(): Observable<any> {
    return this.mouseClickReferenceEvent.pipe(
      filter(() => this.triggerType() === 'click'),
      tap((event: MouseEvent) => {
        const curVisible: boolean = this.state.visibleSubject.getValue();

        if (curVisible) {
          this.hiddenCallback();
        } else {
          this.visibleCallback();
        }
      })
    );
  }

  watchDocumentClickEvent(): Observable<any> {
    return fromEvent(document, 'click').pipe(
      tap((event: Event) => {
        // check if click on overlay floating
        const inOverlay: boolean = findOverlay(event.target as HTMLElement, this.id);
        this.mouseOverState.floating.next(inOverlay);

        // check if click on reference
        const inTrigger: boolean = findReference(event.target as HTMLElement, this.id);
        this.mouseOverState.reference.next(inTrigger);

        if (this.triggerType() === 'click') {
          const clickOverlayId: string | null = inAnyOverlay(event.target as HTMLElement);

          if (!(clickOverlayId && isChildrenOfParent(clickOverlayId, this.id))) {
            this.mouseOverState.subFloatings.next(new Set());
          }
        }
      }),
      switchMap((event: Event) => {
        return this.mouseOverState.isOverAny.pipe(take(1));
      }),
      filter(() => this.state.visibleSubject.getValue()),
      tap((isOver: boolean) => {
        if (!isOver || this.props.isClickHide) {
          this.hiddenCallback();
        }
      })
    );
  }

  // TODO may be use property change event
  watchVisibleChange(): Observable<any> {
    return combineLatest([this.watchStateChange('displayStyle')]).pipe(
      tap(([v]) => {
        asyncScheduler.schedule(() => {
          this.updatePosEvent.next(true);
        }, 60);
      })
    );
  }

  floatingDisplayStateCallback(mutationsList: MutationRecord[], observer: MutationObserver) {
    const displayEvents: MutationRecord[] = mutationsList.filter(
      one => one.type === 'attributes' && one.attributeName === 'data-sld-display'
    );

    const display = displayEvents.length > 0 ? displayEvents[0] : null;

    if (display) {
      asyncScheduler.schedule(() => {
        this.updatePosEvent.next(true);
      });
    }
  }

  noticeParentOverlay(): Observable<any> {
    return this.state.visibleSubject.pipe(
      tap((isVisible: boolean) => {
        if (this.parentOverlayId) {
          const parent: SldOverlay | undefined = SldOverlay.SldOverlayInstances.get(this.parentOverlayId);
          if (!parent) {
            return;
          }

          if (isVisible) {
            parent.subFloatingOverCallback(this.id);
          } else {
            parent.subFloatingLeaveCallback(this.id);
          }
        }
      })
    );
  }

  emitState(): Observable<any> {
    return this.state.visibleSubject.pipe(
      distinctUntilChanged(),
      tap((isVisible: boolean) => {
        if (this.props.visibleChange) {
          asyncScheduler.schedule(() => {
            if (this.props.visibleChange) {
              this.props.visibleChange(isVisible);
            }
          }, 100);
        }
      })
    );
  }

  vw(vwStr: VW): number {
    const num: number = Number(_.trimEnd(vwStr, 'vw'));
    return window.document.body ? Math.floor((window.document.body.clientWidth * num) / 100) : 0;
  }

  mergeElementsPosition(): Observable<Partial<IState>> {
    const reference$: Observable<Wrapper> = this.referenceWrapperRef.refChanged();
    const floating$ = this.floatingRef.refChanged();
    const arrow$ = this.arrowRef.refChanged();

    const updatePosEvent$ = this.updatePosEvent.pipe();

    return combineLatest([reference$, floating$, arrow$]).pipe(
      map(([reference, floating, arrowEl]) => {
        const referenceEl: Element = reference.element();
        this.updateReferenceEl(referenceEl as HTMLElement);

        const floatingEl: Element = floating;
        this.updateFloatingEl(floatingEl as HTMLElement);

        return [referenceEl, floating, arrowEl];
      }),
      switchMap(([reference, floating, arrowEl]) => {
        return updatePosEvent$.pipe(
          filter(() => {
            const display = (floating as HTMLDivElement).style.display;
            return display !== 'none';
          }),
          switchMap(up => {
            const padding =
              typeof this.props.shiftPadding == 'string' ? this.vw(this.props.shiftPadding) : this.props.shiftPadding;

            return from(
              computePosition(reference, floating, {
                placement: this.props.placement,
                middleware: [
                  offset(this.props.offset),
                  flip(),
                  shift({ padding: padding }),
                  arrow({ element: arrowEl }),
                ],
              }) as Promise<ComputePositionReturn>
            );
          })
        );
      }),
      map(position => {
        return { position, positionUpdated: true };
      })
    );
  }

  mergePositionUpdated(): Observable<boolean> {
    return this.watchStateChange('position').pipe(
      filter(pos => pos !== null && !this.state.positionUpdated),
      map(() => true)
    );
  }

  updateReferenceEl(el: HTMLElement) {
    if (this.referenceEl && this.referenceEl === el) {
      return;
    }

    if (this.referenceEl !== null) {
      this.delReferenceListener(this.referenceEl);
      this.referenceEl = null;
    }

    this.referenceEl = el;
    this.parentOverlayId = this.findReferenceParentOverlay(this.referenceEl);
    this.addReferenceListener(this.referenceEl);
  }

  addReferenceListener(referenceElement: HTMLElement) {
    if (!referenceElement.getAttribute(attrNameSldRole)) {
      referenceElement.setAttribute(attrNameSldRole, 'trigger');
      referenceElement.setAttribute(attrNameSldTrigger, this.id);

      referenceElement.addEventListener('mouseover', this.referenceOverCallback);
      referenceElement.addEventListener('mouseleave', this.referenceLeaveCallback);
      referenceElement.addEventListener('click', this.referenceClickCallback);
      referenceElement.addEventListener('scroll', this.scrollCallback);

      this.referenceObserver.observe(referenceElement);
    }
  }

  delReferenceListener(referenceElement: HTMLElement) {
    referenceElement.removeEventListener('mouseover', this.referenceOverCallback);
    referenceElement.removeEventListener('mouseleave', this.referenceLeaveCallback);
    referenceElement.removeEventListener('click', this.referenceClickCallback);
    referenceElement.removeEventListener('scroll', this.scrollCallback);

    this.referenceObserver.disconnect();
  }

  updateFloatingEl(el: HTMLElement) {
    this.addFloatingListener(el);
  }

  addFloatingListener(floating: HTMLElement) {
    if (!floating.getAttribute(attrNameSldRole)) {
      floating.setAttribute(attrNameSldRole, 'float');
      floating.addEventListener('mouseover', this.floatingOverCallback);
      floating.addEventListener('mouseleave', this.floatingLeaveCallback);
      floating.addEventListener('click', this.floatingClickCallback);

      this.addFloatingObserver(floating);
    }
  }

  delFloatingListener(floating: HTMLDivElement) {
    floating.removeEventListener('mouseover', this.floatingOverCallback);
    floating.removeEventListener('mouseleave', this.floatingLeaveCallback);
    floating.removeEventListener('click', this.floatingClickCallback);

    this.delFloatingObserver(floating);
  }

  addFloatingObserver(floating: HTMLElement) {
    this.floatingObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) =>
      this.floatingDisplayStateCallback(mutations, observer)
    );
    this.floatingObserver.observe(floating, { attributes: true });
  }

  delFloatingObserver(floating: HTMLElement) {
    if (this.floatingObserver) {
      this.floatingObserver.disconnect();
      this.floatingObserver = null;
    }
  }

  findReferenceParentOverlay(referenceElement: HTMLElement): string | null {
    if (referenceElement.parentElement) {
      const parent = referenceElement.parentElement;
      if (parent.hasAttribute(attrNameSldOverlay)) {
        return parent.getAttribute(attrNameSldOverlay) as string;
      } else {
        return this.findReferenceParentOverlay(parent);
      }
    } else {
      return null;
    }
  }

  genArrowDir(placement: Side): Side {
    switch (placement) {
      case 'left': {
        return 'right';
      }
      case 'right': {
        return 'left';
      }
      case 'top': {
        return 'bottom';
      }
      case 'bottom': {
        return 'top';
      }
      default: {
        return 'top';
      }
    }
  }

  genArrowDirCss(dir: Side): string {
    switch (dir) {
      case 'left': {
        return styles.toLeft;
      }
      case 'right': {
        return styles.toRight;
      }

      case 'top': {
        return styles.toTop;
      }
      case 'bottom': {
        return styles.toBottom;
      }
      default: {
        return '';
      }
    }
  }

  genAnimationCss(placement: Placement) {
    switch (placement) {
      case 'bottom': {
        return styles.bottom;
      }
      case 'bottom-start': {
        return styles.bottomStart;
      }
      case 'bottom-end': {
        return styles.bottomEnd;
      }
      case 'right': {
        return styles.right;
      }
      case 'right-start': {
        return styles.rightStart;
      }
      case 'right-end': {
        return styles.rightEnd;
      }
      case 'left': {
        return styles.left;
      }
      case 'left-start': {
        return styles.leftStart;
      }
      case 'left-end': {
        return styles.leftEnd;
      }
      case 'top': {
        return styles.top;
      }
      case 'top-start': {
        return styles.topStart;
      }
      case 'top-end': {
        return styles.topEnd;
      }
      default: {
        return '';
      }
    }
  }

  genFloatStyles(): CSSProperties {
    const position = this.state.position;
    const overlayStyleCss: CSSProperties = {
      zIndex: this.props.zIndex,
      display: this.state.displayStyle,
      visibility: this.state.visibleStyle,
      animationPlayState: this.state.animationPlay,
    };

    if (position) {
      if (this.props.positionFixed) {
        const deltaY = window.scrollY;
        const deltaX = window.scrollX;

        overlayStyleCss.left = (position.x || 0) - deltaX + 'px';
        overlayStyleCss.top = (position.y || 0) - deltaY + 'px';
        overlayStyleCss.position = 'fixed';

        if (this.fixedStyleCss && this.isScrolling.getValue().isScrolling) {
          overlayStyleCss.top = this.fixedStyleCss.top;
          overlayStyleCss.left = this.fixedStyleCss.left;
        } else {
          this.fixedStyleCss = overlayStyleCss;
        }
      } else {
        overlayStyleCss.left = (position.x || 0) + 'px';
        overlayStyleCss.top = (position.y || 0) + 'px';
      }
    }

    return overlayStyleCss;
  }

  genArrowStyles(): CSSProperties {
    const arrowStyleCss: CSSProperties = {};
    const position = this.state.position;

    const arrowObject = position?.middlewareData.arrow;
    const basePlacement: Side = position?.placement.split('-')[0] as Side;

    if (arrowObject) {
      if (basePlacement === 'bottom') {
        arrowStyleCss.left = (arrowObject.x || 0) + 'px';
        arrowStyleCss.top = (arrowObject.y || 0) + 'px';
      } else if (basePlacement === 'top') {
        arrowStyleCss.left = (arrowObject.x || 0) + 'px';
        arrowStyleCss.bottom = (arrowObject.y || 0) + 'px';
      } else if (basePlacement === 'left') {
        arrowStyleCss.right = (arrowObject.x || 0) + 'px';
        arrowStyleCss.top = (arrowObject.y || 0) + 'px';
      } else if (basePlacement === 'right') {
        arrowStyleCss.left = (arrowObject.x || 0) + 'px';
        arrowStyleCss.top = (arrowObject.y || 0) + 'px';
      }
    }

    return arrowStyleCss;
  }

  genArrowClassName(): string {
    const basePlacement: Side = this.state.position?.placement.split('-')[0] as Side;
    const arrowDir: Side = this.genArrowDir(basePlacement);
    return this.genArrowDirCss(arrowDir);
  }

  render() {
    const overlayStyleCss: CSSProperties = this.genFloatStyles();
    const arrowStyleCss: CSSProperties = this.genArrowStyles();
    const overlayClassName = styles.overlayBaseLight;
    const arrowWrapperClassName = styles.arrowLight;

    const arrowClassName: string = this.genArrowClassName();
    const aniClassName: string = this.genAnimationCss(this.props.placement);

    const child = React.Children.only(this.props.children);
    if (_.get(child, 'type', '').toString() === React.Fragment.toString()) {
      throw Error('Overlay trigger need a html element!');
    }

    return (
      <>
        <Wrapper ref={r => (this.referenceWrapperRef.current = r)}>{child}</Wrapper>

        <AppendBody>
          {this.props.useMask ? <div className={styles.mask} style={{ display: this.state.displayStyle }} /> : <></>}

          <div
            className={styleMerge(
              overlayClassName,
              aniClassName,
              'sld-overlay',
              this.props.overlayClassName,
              fontCss.mediumLatin
            )}
            ref={r => {
              this.floatingRef.current = r;
            }}
            style={overlayStyleCss}
            data-sld-display={this.state.displayStyle}
            data-sld-overlay={this.id}
          >
            <div
              className={styleMerge(
                styles.content,
                cssPick(this.props.useBorder, styles.border),
                'sld-overlay-content',
                this.props.useArrow !== false ? arrowClassName : '',
                this.props.contentClassName
              )}
            >
              {this.props.overlay}
            </div>

            <div
              ref={r => (this.arrowRef.current = r)}
              className={styleMerge(arrowWrapperClassName, this.props.useArrow === false ? styles.noArrow : '')}
              style={arrowStyleCss}
            >
              <div className={styleMerge(arrowClassName, 'sld-overlay-arrow')}>
                <div
                  className={styleMerge(
                    styles.inner,
                    cssPick(this.props.useBorder, styles.border),
                    'sld-overlay-arrow-inner'
                  )}
                />
              </div>
            </div>
          </div>
        </AppendBody>
      </>
    );
  }
}
