import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { ShieldOptionType, ShieldOrderInfo } from '../../../../state-manager/state-types';
import { logoImg, decImg, logoDisSize } from './image';
import { SldDecimal, SldDecPercent } from '../../../../util/decimal';
import { styleMerge } from '../../../../util/string';
import { fontCss } from '../../../i18n/font-switch';
import { i18n } from '../../../i18n/i18n-fn';
import styles from './poster.module.less';
import { SLD_ENV_CONF } from '../../const/env';

type IState = {
  isMobile: boolean;
};
type IProps = {
  curOrder: ShieldOrderInfo;
  forceWidth?: number;
};
type Pos = { x: number; y: number };

export class Poster extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  private width = 480 * 2;
  private height = 600 * 2;
  private disWidth = 480;
  private disHeight = 600;

  private canvas: HTMLCanvasElement | null = null;
  private context2D: CanvasRenderingContext2D | null = null;

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.draw();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (this.props.curOrder !== prevProps.curOrder || this.props.forceWidth !== prevProps.forceWidth) {
      this.draw();
    }
  }

  initCanvas(dom) {
    if (!this.canvas && dom) {
      this.canvas = dom as HTMLCanvasElement;
      this.context2D = this.canvas.getContext('2d');

      if (this.context2D) {
        this.context2D.scale(2, 2);
      }
    }
  }

  draw() {
    if (!this.context2D) {
      return;
    }

    this.drawBg({ x: 0, y: 0 });
    this.drawLogo({ x: 40, y: 40 });
    this.drawSubTitle({ x: 42, y: 100 });
    this.drawInner({ x: 50, y: 140 });
    this.drawDecorate({ x: 340, y: 110 });
    this.drawFooter({ x: 0, y: 570 });
  }

  private drawBg(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    const gradient = this.context2D.createLinearGradient(pos.x, pos.y, this.width, this.height);
    gradient.addColorStop(0, '#051D3F');
    gradient.addColorStop(1, '#000306');

    this.context2D.fillStyle = gradient;
    this.context2D.fillRect(pos.x, pos.y, this.width, this.height);
  }

  private drawLogo(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.drawImage(logoImg, pos.x, pos.y, logoDisSize.w, logoDisSize.h);
  }

  private drawDecorate(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.drawImage(decImg, pos.x, pos.y, 102, 87);
  }

  private drawSubTitle(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.font = '14px sans-serif';
    this.context2D.fillStyle = 'rgba(255,255,255, 0.5)';
    this.context2D.fillText(i18n('trade-poster-sub-title'), pos.x, pos.y);
  }

  private drawInner(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.fillStyle = '#ffffff';
    this.context2D.beginPath();
    this.context2D.roundRect(pos.x, pos.y, 380, 400, 16);
    this.context2D.closePath();
    this.context2D.fill();

    this.drawInnerContent(pos);
  }

  private drawInnerContent(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.font = '28px Gilroy-Bold, sans-serif';
    this.context2D.fillStyle = '#000000';
    this.context2D.fillText(i18n('trade-poster-perpetual-option'), pos.x + 20, pos.y + 24 + 20);

    if (this.props.curOrder.optionType === ShieldOptionType.Call) {
      this.drawLong({ x: pos.x + 22, y: pos.y + 72 });
    } else {
      this.drawShort({ x: pos.x + 22, y: pos.y + 72 });
    }

    this.drawPair({ x: pos.x + 120, y: pos.y + 93 });
    this.drawProfit({ x: pos.x + 22, y: pos.y + 132 });
    this.drawPrice({ x: pos.x + 22, y: pos.y + 310 });
  }

  private drawLong(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    const fontOffsetY = 20;
    const fontOffsetX = 40;

    const width = 80;
    const height = 28;

    this.context2D.strokeStyle = 'rgba(21, 179, 132)';
    this.context2D.lineWidth = 1.5;
    this.context2D.beginPath();
    this.context2D.roundRect(pos.x, pos.y, width, height, 8);
    this.context2D.closePath();
    this.context2D.stroke();

    this.context2D.fillStyle = 'rgba(21, 179, 132, 0.06)';
    this.context2D.fill();

    this.context2D.font = '16px Gilroy-Bold, sans-serif';
    this.context2D.fillStyle = 'rgba(21, 179, 132)';
    this.context2D.textAlign = 'center';
    this.context2D.fillText(i18n('trade-option-type-call').toUpperCase(), pos.x + fontOffsetX, pos.y + fontOffsetY);
    this.context2D.textAlign = 'left';
  }

  private drawShort(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    const fontOffsetY = 20;
    const fontOffsetX = 40;

    const width = 80;
    const height = 28;

    this.context2D.strokeStyle = '#f55858';
    this.context2D.lineWidth = 1.5;
    this.context2D.beginPath();
    this.context2D.roundRect(pos.x, pos.y, width, height, 8);
    this.context2D.closePath();
    this.context2D.stroke();

    this.context2D.fillStyle = 'rgba(245, 88, 88, 0.06)';
    this.context2D.fill();

    this.context2D.textAlign = 'center';
    this.context2D.font = '16px Gilroy-Bold, sans-serif';
    this.context2D.fillStyle = '#f55858';
    this.context2D.fillText(i18n('trade-option-type-put').toUpperCase(), pos.x + fontOffsetX, pos.y + fontOffsetY);
  }

  private drawAmount(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    const textHeight = 22;

    this.context2D.font = '22px Gilroy-Bold, sans-serif';
    this.context2D.fillStyle = '#555555';

    const amountStr: string = this.props.curOrder.orderAmount.format() || '';
    const measure = this.context2D.measureText(amountStr);
    this.context2D.fillText(amountStr, pos.x + 120, pos.y + textHeight);

    this.context2D.font = '16px Gilroy-Medium, sans-serif';
    this.context2D.fillStyle = '#999999';

    const underlying = this.props.curOrder.indexUnderlying;

    this.context2D.fillText(underlying || '', pos.x + 120 + measure.width + 8, pos.y + textHeight);
  }

  private drawPair(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.textAlign = 'left';
    this.context2D.font = '20px Gilroy-Bold, sans-serif';
    this.context2D.fillStyle = '#999999';

    const pair = this.props.curOrder.indexUnderlying + 'USD/' + this.props.curOrder.token.symbol;
    this.context2D.fillText(pair || '', pos.x, pos.y);
  }

  private drawProfit(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    const textHeight = 100;

    const profit = this.props.curOrder?.pnl?.profit || SldDecimal.ZERO;
    const cost = this.props.curOrder?.fundingFee.paid || SldDecimal.ZERO;

    const percent = profit.gtZero() ? SldDecPercent.fromArgs(cost, profit) : SldDecPercent.ZERO;

    this.context2D.font = '80px Gilroy-Bold, sans-serif';
    this.context2D.textAlign = 'left';
    this.context2D.fillStyle = '#15b384';
    this.context2D.fillText(
      '+' + percent.percentFormat({ fix: 1, removeZero: true, split: false }) + '%',
      pos.x,
      pos.y + textHeight
    );
  }

  private drawPrice(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.fillStyle = '#f3f6f9';
    this.context2D.beginPath();
    this.context2D.roundRect(pos.x, pos.y, 334, 64, 8);
    this.context2D.closePath();
    this.context2D.fill();

    const textHeight = 24;

    this.context2D.font = '14px Gilroy-Medium, sans-serif';
    this.context2D.fillStyle = '#666666';
    this.context2D.fillText(i18n('trade-index-open-price'), pos.x + 20, pos.y + textHeight);
    this.context2D.fillText(i18n('trade-index-mark-price'), pos.x + 20, pos.y + textHeight * 2);

    const open = this.props.curOrder.openPrice.format() || '';
    const mark = this.props.curOrder.markPrice?.format() || '';

    this.context2D.textAlign = 'right';
    this.context2D.fillText(open, pos.x + 312, pos.y + textHeight);
    this.context2D.fillText(mark, pos.x + 312, pos.y + textHeight * 2);
    this.context2D.textAlign = 'left';
  }

  private drawFooter(pos: Pos) {
    if (!this.context2D) {
      return;
    }

    this.context2D.fillStyle = '#1346ff';
    this.context2D.fillRect(pos.x, pos.y, this.width, 30);

    const textHeight = 20;
    this.context2D.textAlign = 'right';
    this.context2D.fillStyle = 'rgba(255,255,255,0.8)';
    this.context2D.font = '16px sans-serif';

    this.context2D.fillText(SLD_ENV_CONF.Brand.Domain, pos.x + 460, pos.y + textHeight);
    this.context2D.textAlign = 'left';
  }

  public download() {
    if (!this.canvas) {
      return;
    }

    const url: string = this.canvas.toDataURL('image/png');

    const a: HTMLAnchorElement = document.createElement('a');
    a.download = SLD_ENV_CONF.Brand.Project + '_options';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  public url(): string | null {
    if (!this.canvas) {
      return null;
    }

    return this.canvas.toDataURL('image/png');
  }

  render() {
    const dw = this.props.forceWidth ? Math.min(this.props.forceWidth, this.disWidth) : this.disWidth;
    const dh = this.props.forceWidth ? dw * (this.disHeight / this.disWidth) : this.disHeight;

    return (
      <canvas
        className={styleMerge(styles.fontM, fontCss.medium)}
        id="poster-canvas"
        width={this.width}
        height={this.height}
        style={{ width: dw + 'px', height: dh + 'px' }}
        ref={dom => this.initCanvas(dom)}
      />
    );
  }
}
