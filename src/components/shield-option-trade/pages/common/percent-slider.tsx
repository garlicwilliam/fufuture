import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../util/string';
import styles from './percent-slider.module.less';
import { SldDecimal, SldDecPercent } from '../../../../util/decimal';
import { CSSProperties, MouseEvent, TouchEvent } from 'react';
import { Resize } from '../../../common/utils/resize';
import { px } from '../../../common/svg/util-function';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap, last } from 'rxjs/operators';

type PProps = {
  active$: Observable<boolean>;
  onClick: () => void;
};
type PState = {
  isMobile: boolean;
  isActive: boolean;
};
class Point extends BaseStateComponent<PProps, PState> {
  state: PState = {
    isMobile: P.Layout.IsMobile.get(),
    isActive: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.subWithId(this.props.active$, 'isActive', isActive => {
      this.updateState({ isActive });
    });
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<PProps>, prevState: Readonly<PState>, snapshot?: any) {
    if (this.props.active$ !== prevProps.active$)
      this.subWithId(this.props.active$, 'isActive', isActive => {
        this.updateState({ isActive });
      });
  }

  onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onClick();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div
        className={styleMr(styles.pointWrapper, cssPick(this.state.isActive, styles.active))}
        onMouseDown={this.onClick.bind(this)}
      >
        <div className={styleMr(styles.pointInner, cssPick(this.state.isActive, styles.active))} />
      </div>
    );
  }
}

type LProps = {
  active$: Observable<SldDecPercent>;
};
type LState = {
  isMobile: boolean;
};
class Line extends BaseStateComponent<LProps, LState> {
  state: LState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  private dom$: BehaviorSubject<HTMLDivElement | null> = new BehaviorSubject<HTMLDivElement | null>(null);

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.subWithId(this.applyActive(this.props.active$), 'activeWidth');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<LProps>, prevState: Readonly<LState>, snapshot?: any) {
    if (prevProps.active$ !== this.props.active$) {
      this.subWithId(this.applyActive(this.props.active$), 'activeWidth');
    }
  }

  private applyActive(percent$: Observable<SldDecPercent>) {
    return combineLatest([this.dom$, percent$]).pipe(
      filter(([dom, percent]) => {
        return dom !== null;
      }),
      tap(([dom, percent]) => {
        dom!.style.width = percent.percentFormat() + '%';
      })
    );
  }

  private initDom(dom: HTMLDivElement | null) {
    this.dom$.next(dom);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.lineWrapper)}>
        <div className={styleMr(styles.lineInner)} ref={dom => this.initDom(dom)} />
      </div>
    );
  }
}

type SProps = {
  styles?: CSSProperties;
  onPress: (event: PositionEvent) => void;
  param$: Observable<SliderParam>;
  showValue: boolean;
};
type SState = {
  isMobile: boolean;
};
class Slider extends BaseStateComponent<SProps, SState> {
  state: SState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  private domSubject$ = new BehaviorSubject<HTMLDivElement | null>(null);
  private half = 8;

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.subWithId(this.applyParam(this.props.param$), 'leftPos');
  }

  componentWillUnmount() {
    this.destroyState();
    this.domSubject$.complete();
  }

  componentDidUpdate(prevProps: Readonly<SProps>, prevState: Readonly<SState>, snapshot?: any) {
    if (prevProps.param$ !== this.props.param$) {
      this.subWithId(this.applyParam(this.props.param$), 'leftPos');
    }
  }

  applyParam(param$: Observable<SliderParam>): Observable<any> {
    return combineLatest([param$, this.domSubject$]).pipe(
      filter(([param, dom]) => {
        return dom !== null;
      }),
      tap(([param, dom]) => {
        const leftPx = px(param.pos - this.half);
        if (leftPx && dom) {
          dom.style.left = leftPx;
          (dom.lastChild as HTMLDivElement).innerText = param.val.percentFormat({ fix: 0 }) + '%';
        }
      })
    );
  }

  onMouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.props.onPress(event);
  }

  onTouchStart(event: TouchEvent) {
    const touch: React.Touch = event.touches.item(0);
    this.props.onPress(touch);
  }

  onMouseUp(event: MouseEvent) {}

  initDom(dom: HTMLDivElement | null) {
    this.domSubject$.next(dom);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div
        className={styleMr(styles.sliderWrapper)}
        onMouseDown={this.onMouseDown.bind(this)}
        onTouchStart={this.onTouchStart.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        ref={dom => this.initDom(dom)}
      >
        <div className={styleMr(styles.sliderInner)} />
        <div className={styleMr(styles.tap)} />
        <div
          id="percent-val-display"
          className={styleMr(styles.valueDisplay, cssPick(this.props.showValue, styles.visible))}
        >
          0%
        </div>
      </div>
    );
  }
}

// ---------------------------------------------------------------------------------

type PositionAxis = { x: number; y: number };
type DragStart = {
  eventPos: PositionAxis;
  sliderPos: number;
};
type AxisState = {
  line0: SldDecPercent;
  line1: SldDecPercent;
  line2: SldDecPercent;
  line3: SldDecPercent;
  point0: boolean;
  point1: boolean;
  point2: boolean;
  point3: boolean;
  point4: boolean;
};
type SliderParam = { pos: number; val: SldDecPercent };
type PositionEvent = { clientX: number; clientY: number };
const DefaultAxis: AxisState = {
  line0: SldDecPercent.ZERO,
  line1: SldDecPercent.ZERO,
  line2: SldDecPercent.ZERO,
  line3: SldDecPercent.ZERO,
  point0: false,
  point1: false,
  point2: false,
  point3: false,
  point4: false,
};
const PointPercent = [
  SldDecPercent.ZERO,
  SldDecPercent.genPercent('25'),
  SldDecPercent.genPercent('50'),
  SldDecPercent.genPercent('75'),
  SldDecPercent.HUNDRED,
];
const PointSpan = SldDecPercent.genPercent('25');

type IState = {
  isMobile: boolean;
  width: number;
  showValue: boolean;
};
type IProps = {
  percent: SldDecPercent;
  onChange: (percent: SldDecPercent) => void;
};

export class SldPercentSlider extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    width: 310,
    showValue: false,
  };

  private readonly pointHalf = 5;
  private wrapperDom: HTMLDivElement | null = null;

  private draggingVal$ = new BehaviorSubject<SldDecPercent | null>(null);
  private isDragging$: BehaviorSubject<DragStart | null> = new BehaviorSubject<DragStart | null>(null);
  private draggingPos$: Subject<PositionAxis> = new Subject<PositionAxis>();

  private inputVal$ = new BehaviorSubject<SldDecPercent | undefined>(undefined);
  private sliderParams$ = new BehaviorSubject<SliderParam>({ pos: this.pointHalf, val: SldDecPercent.ZERO });
  private axisState$ = new BehaviorSubject<AxisState>(DefaultAxis);

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.inputVal$.next(this.props.percent);

    this.sub(
      this.watchParam().pipe(
        tap(param => {
          this.sliderParams$.next(param);
          const axis = this.valueToAxis(param.val);
          this.axisState$.next(axis);
        })
      )
    );
  }

  componentWillUnmount() {
    this.destroyState();
    this.isDragging$.complete();
    this.draggingPos$.complete();
    this.draggingVal$.complete();

    this.inputVal$.complete();
    this.sliderParams$.complete();
    this.axisState$.complete();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (!prevProps.percent.eq(this.props.percent)) {
      this.inputVal$.next(this.props.percent);
    }
  }

  private valueToPos(val: SldDecPercent, axisLen?: SldDecimal): number {
    const axis = axisLen ? axisLen : this.axisLength;
    return this.pointHalf + Number(val.applyTo(axis).toNumeric());
  }

  private watchParam(): Observable<SliderParam> {
    const axisLength$: Observable<SldDecimal> = this.watchStateChange('width').pipe(
      map(() => {
        return this.axisLength;
      })
    );

    const inputParam$: Observable<SliderParam> = combineLatest([axisLength$, this.inputVal$]).pipe(
      filter(([axisLen, inputVal]) => {
        return Boolean(inputVal);
      }),
      map(([axisLen, inputVal]) => {
        const pos = this.valueToPos(inputVal!, axisLen);
        return { pos, val: inputVal! };
      })
    );

    const draggingParam$ = this.dragEvents();

    return combineLatest([inputParam$, draggingParam$]).pipe(
      map(([input, drag]) => {
        if (drag === null) {
          return input;
        } else {
          return drag;
        }
      })
    );
  }

  private valueToAxis(percent: SldDecPercent): AxisState {
    const line0 = this.genLineActivePercent(0, percent);
    const line1 = this.genLineActivePercent(1, percent);
    const line2 = this.genLineActivePercent(2, percent);
    const line3 = this.genLineActivePercent(3, percent);

    const point0 = this.genPointActive(0, percent);
    const point1 = this.genPointActive(1, percent);
    const point2 = this.genPointActive(2, percent);
    const point3 = this.genPointActive(3, percent);
    const point4 = this.genPointActive(4, percent);

    return {
      line0,
      line1,
      line2,
      line3,
      point0,
      point1,
      point2,
      point3,
      point4,
    } as AxisState;
  }

  private genLineActivePercent(index: number, totalPercent: SldDecPercent): SldDecPercent {
    const beginPoint = PointPercent[index];
    const endPoint = PointPercent[index + 1];

    if (totalPercent.lte(beginPoint)) {
      return SldDecPercent.ZERO;
    } else if (totalPercent.gt(beginPoint) && totalPercent.lt(endPoint)) {
      const overflow: SldDecPercent = totalPercent.sub(beginPoint);
      return SldDecPercent.fromArgs(PointSpan.toDecimal(), overflow.toDecimal());
    } else {
      return SldDecPercent.HUNDRED;
    }
  }

  private genPointActive(index: number, totalPercent: SldDecPercent): boolean {
    return totalPercent.gte(PointPercent[index]);
  }

  get minSliderPos() {
    return this.pointHalf;
  }

  get maxSliderPos() {
    return this.state.width - this.pointHalf;
  }

  get axisLength(): SldDecimal {
    return SldDecimal.fromNumeric(Math.round(this.maxSliderPos - this.minSliderPos).toString(), 0);
  }

  private sliderPosToValue(sliderPos: number): SldDecPercent {
    if (sliderPos < this.minSliderPos) {
      sliderPos = this.minSliderPos;
    }

    if (sliderPos > this.maxSliderPos) {
      sliderPos = this.maxSliderPos;
    }

    const total: SldDecimal = this.axisLength;
    const leftPart: SldDecimal = SldDecimal.fromNumeric((sliderPos - this.minSliderPos).toString(), 0);

    return SldDecPercent.fromArgs(total, leftPart);
  }

  private onQuickSelect(event: MouseEvent) {
    if (this.wrapperDom) {
      const rect = this.wrapperDom.getBoundingClientRect();
      const domLeft = rect.left;
      const posLeft = event.clientX;

      const pos = posLeft - domLeft;

      const newValue = this.sliderPosToValue(pos);

      this.emitChange(newValue);
    }
  }

  private onBeginMove(event: PositionEvent) {
    const curPos = this.sliderParams$.getValue();
    const dragStart = { eventPos: { x: event.clientX, y: event.clientY }, sliderPos: curPos.pos };

    this.updateState({ showValue: true });
    this.isDragging$.next(dragStart);
  }

  private onMoving(event: PositionEvent) {
    this.draggingPos$.next({ x: event.clientX, y: event.clientY });
  }

  private onTouchMoving(event: TouchEvent) {
    const touch = event.touches.item(0);
    this.onMoving(touch);
  }

  private onEndMove(event: any) {
    if (this.isDragging$.getValue()) {
      this.isDragging$.next(null);
    }
  }

  private dragEvents(): Observable<SliderParam | null> {
    return this.isDragging$.pipe(
      switchMap(begin => {
        if (begin) {
          return this.draggingPos$.pipe(
            map((moving: PositionAxis) => {
              const deltaPx: number = moving.x - begin.eventPos.x;
              let pos: number = begin.sliderPos + deltaPx;
              pos = Math.min(Math.max(pos, this.minSliderPos), this.maxSliderPos);

              return pos;
            }),
            distinctUntilChanged(),
            map((sliderPos: number) => {
              const percentStr: string = this.sliderPosToValue(sliderPos).percentFormat({ fix: 0 });
              const percent: SldDecPercent = SldDecPercent.genPercent(percentStr);
              sliderPos = this.valueToPos(percent);

              this.draggingVal$.next(percent);

              return [percent, sliderPos] as [SldDecPercent, number];
            }),
            distinctUntilChanged((pre, cur) => pre[0] === cur[0]),
            map(([percent, sliderPos]) => {
              return { val: percent, pos: sliderPos };
            })
          );
        } else {
          const lastDragVal = this.draggingVal$.getValue();

          if (lastDragVal) {
            this.inputVal$.next(lastDragVal);

            this.emitChange(lastDragVal);

            this.draggingVal$.next(null);
          }

          return of(null);
        }
      })
    );
  }

  private axisOne(name: string): Observable<any> {
    return this.axisState$.pipe(
      map(states => {
        return states[name];
      })
    );
  }

  private onDomInit(dom: HTMLDivElement | null) {
    if (dom) {
      this.wrapperDom = dom;
    }
  }

  private emitChange(percent: SldDecPercent) {
    this.props.onChange(percent);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div
        className={styleMr(styles.outerWrapper)}
        onMouseDown={this.onQuickSelect.bind(this)}
        onMouseMove={this.onMoving.bind(this)}
        onMouseUp={this.onEndMove.bind(this)}
        onMouseLeave={event => {
          this.onEndMove(event);
          this.updateState({ showValue: false });
        }}
        onMouseOver={() => {
          if (!this.state.isMobile) {
            this.updateState({ showValue: true });
          }
        }}
        onTouchMove={event => {
          this.updateState({ showValue: true });
          this.onTouchMoving(event);
        }}
        onTouchEnd={event => {
          this.onEndMove(event);
          this.updateState({ showValue: false });
        }}
        id="slider-wrapper"
        ref={dom => this.onDomInit(dom)}
      >
        <Resize onResize={w => this.updateState({ width: w })}>
          <div className={styleMr(styles.wrapper)}>
            <Point active$={this.axisOne('point0')} onClick={() => this.emitChange(PointPercent[0])} />
            <Line active$={this.axisOne('line0')} />
            <Point active$={this.axisOne('point1')} onClick={() => this.emitChange(PointPercent[1])} />
            <Line active$={this.axisOne('line1')} />
            <Point active$={this.axisOne('point2')} onClick={() => this.emitChange(PointPercent[2])} />
            <Line active$={this.axisOne('line2')} />
            <Point active$={this.axisOne('point3')} onClick={() => this.emitChange(PointPercent[3])} />
            <Line active$={this.axisOne('line3')} />
            <Point active$={this.axisOne('point4')} onClick={() => this.emitChange(PointPercent[4])} />

            <Slider
              param$={this.sliderParams$}
              showValue={this.state.showValue}
              onPress={event => this.onBeginMove(event)}
            />
          </div>
        </Resize>
      </div>
    );
  }
}
