import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { asyncScheduler, BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { CSSProperties } from 'react';
import { styleMerge } from '../../../util/string';

type IProps = {
  onResize?: (width: number) => void;
  onHeightResize?: (height: number) => void;
  greedy?: boolean; // default true
  className?: string;
};
type IState = {};

export class Resize extends BaseStateComponent<IProps, IState> {
  private resizeEvent: Subject<any> = new Subject<any>();
  private containerDom = new BehaviorSubject<HTMLDivElement | HTMLSpanElement | null>(null);
  private sizeObserver: ResizeObserver | null = new ResizeObserver(entry => {
    asyncScheduler.schedule(() => {
      this.resizeEvent.next(true);
    });
  });

  private sizeSubject: Subject<[number, number]> = new Subject<[number, number]>();

  componentDidMount() {
    this.sub(this.dealWithResize());

    this.sub(this.watchRealSize(), (size: [number, number]) => {
      this.sizeSubject.next(size);
    });

    this.sub(this.filterRealWidth(), (width: number) => {
      if (this.props.onResize) {
        this.props.onResize(width);
      }
    });

    this.sub(this.filterRealHeight(), (height: number) => {
      if (this.props.onHeightResize) {
        this.props.onHeightResize(height);
      }
    });
  }

  componentWillUnmount() {
    this.destroyState();

    if (this.sizeObserver) {
      this.sizeObserver.disconnect();
      this.sizeObserver = null;
    }
    this.containerDom.complete();
    this.resizeEvent.complete();
    this.sizeSubject.complete();
  }

  dealWithResize(): Observable<any> {
    return this.containerDom.pipe(
      filter(dom => dom !== null),
      map(dom => dom as HTMLDivElement | HTMLSpanElement),
      tap((container: HTMLDivElement | HTMLSpanElement) => {
        this.sizeObserver?.observe(container);
      })
    );
  }

  watchRealSize(): Observable<[number, number]> {
    return this.resizeEvent.pipe(
      switchMap(e => {
        return this.containerDom.pipe(
          filter(dom => dom !== null),
          map(dom => dom as HTMLDivElement | HTMLSpanElement),
          take(1)
        );
      }),
      map((dom: HTMLDivElement | HTMLSpanElement) => {
        const rect = dom.getBoundingClientRect();
        return [rect.width, rect.height];
      })
    );
  }

  filterRealWidth(): Observable<number> {
    return this.sizeSubject.pipe(
      map((size: [number, number]) => size[0]),
      distinctUntilChanged()
    );
  }

  filterRealHeight(): Observable<number> {
    return this.sizeSubject.pipe(
      map((size: [number, number]) => size[1]),
      distinctUntilChanged()
    );
  }

  render() {
    const notGreedy: boolean = this.props.greedy === false;
    const styles: CSSProperties = {
      display: notGreedy ? 'inline-block' : 'block',
      width: notGreedy ? '' : '100%',
    };
    const position: CSSProperties = {
      position: 'relative',
    };

    return notGreedy ? (
      <span ref={d => this.containerDom.next(d)} className={this.props.className} style={styles}>
        {this.props.children}
      </span>
    ) : (
      <div
        ref={d => this.containerDom.next(d)}
        className={styleMerge('sldResize', this.props.className)}
        style={Object.assign({}, styles, position)}
      >
        {this.props.children}
      </div>
    );
  }
}
