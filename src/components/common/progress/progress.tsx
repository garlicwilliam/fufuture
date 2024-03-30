import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './progress.module.less';
import { styleMerge } from '../../../util/string';
import { P } from '../../../state-manager/page/page-state-parser';
import { CSSProperties } from 'react';

type IProps = {
  strokeWidth: number;
  percent: number;
  percent2?: number;
  colorClassName?: string;
  className?: string;
  minDisplay?: number;
};
type IState = {
  isMobile: boolean;
};

export class SldProgress extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  private genInnerStyle(): CSSProperties {
    const miniDis = this.props.percent > 0 ? this.props.minDisplay || 0 : 0;

    const style: CSSProperties = {
      height: this.props.strokeWidth + 'px',
      width: Math.max(this.props.percent, miniDis) + '%',
    };

    return style;
  }

  private genInner2Style(): CSSProperties {
    const percent2 = this.props.percent2 || 0;
    const miniDis = percent2 > 0 ? this.props.minDisplay || 0 : 0;

    const style: CSSProperties = {
      height: this.props.strokeWidth + 'px',
      width: Math.max(percent2, miniDis) + '%',
    };

    return style;
  }

  private genShadowStyle(): CSSProperties {
    const style: CSSProperties = {
      height: this.props.strokeWidth + 'px',
    };

    return style;
  }

  private genShadowStyle2(): CSSProperties {
    const style: CSSProperties = {
      height: this.props.strokeWidth + 'px',
    };

    return style;
  }

  private genOuterStyles(): CSSProperties {
    return { height: this.props.strokeWidth + 'px' };
  }

  render() {
    const shadowSizeCss = this.props.strokeWidth > 12 ? 'bold' : 'thin';
    const innerStyle = this.genInnerStyle();
    const innerStyle2 = this.genInner2Style();
    const shadowStyle = this.genShadowStyle();
    const shadowStyle2 = this.genShadowStyle2();
    const outerStyle: CSSProperties = this.genOuterStyles();

    const colorCss = this.props.colorClassName ? this.props.colorClassName : styles.progressColor;

    return (
      <div className={styleMerge(styles.progress, colorCss, this.props.className)}>
        <div className={styleMerge(styles.outer, 'sld-progress-outer')} style={outerStyle}>
          <div className={styleMerge(styles.inner, 'sld-progress-inner')} style={innerStyle}>
            <div className={styleMerge(styles.shadow, 'sld-progress-shadow', shadowSizeCss)} style={shadowStyle} />
          </div>

          {this.props.percent2 === undefined ? null : (
            <div className={styleMerge(styles.inner, 'sld-progress-inner-2')} style={innerStyle2}>
              <div className={styleMerge(styles.shadow, 'sld-progress-shadow-2', shadowSizeCss)} style={shadowStyle2} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
