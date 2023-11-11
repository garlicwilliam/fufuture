import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import styles from './items-box.module.less';
import { CSSProperties } from 'react';
import { styleMerge } from '../../../util/string';
import { Property } from 'csstype';

type IProps = {
  gap: number | [number, number];
  lines?: { repeat: number; height: number } | number[];
  columns?: number | number[];
  className?: string;
  align?: Property.AlignContent;
};
type IState = {
  isMobile: boolean;
};

export class ItemsBox extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  private genHeight(): number | undefined {
    if (!this.props.lines) {
      return undefined;
    }

    let total = 0;
    let count = 0;
    if (Array.isArray(this.props.lines)) {
      total = this.props.lines.reduce((acc: number, line: number) => {
        return acc + line;
      }, 0);
      count = this.props.lines.length;
    } else {
      total = this.props.lines.repeat * this.props.lines.height;
      count = this.props.lines.repeat;
    }

    const gap: number = typeof this.props.gap === 'number' ? this.props.gap : this.props.gap[0];

    return total + gap * (count - 1);
  }

  private genHeightStyle(): CSSProperties {
    const totalHeight: number | undefined = this.genHeight();
    if (totalHeight) {
      const rows = Array.isArray(this.props.lines)
        ? this.props.lines.map(h => h + 'px').join(' ')
        : `repeat(auto-fit, ${this.props.lines?.height}px)`;

      const heightCss: CSSProperties = {
        height: totalHeight + 'px',
        gridTemplateRows: rows,
      };

      return heightCss;
    }

    return {};
  }

  private genWidthStyle(): CSSProperties {
    if (this.props.columns) {
      if (typeof this.props.columns === 'number') {
        return { gridTemplateColumns: new Array(this.props.columns).fill('1fr').join(' ') };
      } else {
        return { gridTemplateColumns: this.props.columns.map(w => w + 'fr').join(' ') };
      }
    } else {
      return {};
    }
  }

  private genGapStyle(): CSSProperties {
    if (typeof this.props.gap === 'number') {
      return { gridRowGap: this.props.gap + 'px' };
    } else {
      return {
        gridRowGap: this.props.gap[0] + 'px',
        gridColumnGap: this.props.gap[1] + 'px',
      };
    }
  }

  private genStyle(): CSSProperties {
    const heightStyle: CSSProperties = this.genHeightStyle();
    const widthStyle: CSSProperties = this.genWidthStyle();
    const gapStyle: CSSProperties = this.genGapStyle();

    return Object.assign({}, heightStyle, widthStyle, gapStyle);
  }

  render() {
    const styleCss = this.genStyle();
    if (this.props.align) {
      styleCss.alignContent = this.props.align;
    }

    return (
      <div className={styleMerge(styles.wrapper, this.props.className)} style={styleCss}>
        {this.props.children}
      </div>
    );
  }
}
