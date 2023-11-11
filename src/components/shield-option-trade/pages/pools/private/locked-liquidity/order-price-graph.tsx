import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './order-price-graph.module.less';
import { IconDropdown } from '../../../../../common/icon/dropdown';
import { computeMakerLiquidationAxis1 } from '../../../../utils/compute';
import { Resize } from '../../../../../common/utils/resize';
import { ShieldMakerOrderInfo, ShieldOptionType } from '../../../../../../state-manager/state-types';
import { SldDecimal } from '../../../../../../util/decimal';
import { I18n } from '../../../../../i18n/i18n';

type IState = {
  isMobile: boolean;
  width: number;
};
type IProps = {
  order: ShieldMakerOrderInfo;
  className?: string;
};

export class OrderPriceGraph extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    width: 0,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  px(point: SldDecimal): string {
    return point.toNumeric(true) + 'px';
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.props.order.markPrice || !this.props.order.liquidationPrice) {
      return <></>;
    }

    const { openPoint, liqPoint, curPoint } = computeMakerLiquidationAxis1(
      this.state.width,
      this.props.order.markPrice,
      this.props.order.openPrice,
      this.props.order.liquidationPrice
    );

    const pastLen: SldDecimal = openPoint.gt(curPoint) ? openPoint.sub(curPoint) : curPoint.sub(openPoint);
    const pastPos: SldDecimal = openPoint.gt(curPoint) ? curPoint : openPoint;

    const isLong = this.props.order.optionType === ShieldOptionType.Call;
    const isShort = this.props.order.optionType === ShieldOptionType.Put;

    return (
      <div className={styleMr(styles.wrapper, this.props.className)}>
        <Resize onResize={w => this.updateState({ width: w })}>
          <div className={styleMr(styles.axis)}>
            <div
              className={styleMr(
                styles.past,
                cssPick(curPoint.gt(openPoint), styles.pastLong),
                cssPick(curPoint.lt(openPoint), styles.pastShort)
              )}
              style={{ left: this.px(pastPos), width: this.px(pastLen) }}
            />
          </div>

          <div className={styleMr(styles.point, styles.descText)} style={{ left: this.px(openPoint) }}>
            <IconDropdown width={10} pointTo={'top'} />
            <div className={styleMr(styles.text1, styles.descText)}>{this.props.order.openPrice.format()}</div>
            <div className={styleMr(styles.text2, styles.openText)}>
              <I18n id={'trade-open'} textUpper={'uppercase'} />
            </div>
          </div>

          <div
            className={styleMr(
              styles.point,
              cssPick(isLong, styles.liqTextLong),
              cssPick(isShort, styles.liqTextShort)
            )}
            style={{ left: this.px(liqPoint) }}
          >
            <IconDropdown width={10} pointTo={'top'} />

            <div
              className={styleMr(
                styles.text1,
                cssPick(isLong, styles.liqTextLong),
                cssPick(isShort, styles.liqTextShort)
              )}
            >
              {this.props.order.liquidationPrice.format()}
            </div>

            <div
              className={styleMr(
                styles.text2,
                cssPick(isLong, styles.liqTextLong),
                cssPick(isShort, styles.liqTextShort)
              )}
            >
              <I18n id={'trade-liquidation'} textUpper={'uppercase'} />
            </div>
          </div>

          <div className={styleMr(styles.point1, styles.currentText)} style={{ left: this.px(curPoint) }}>
            <IconDropdown width={10} pointTo={'down'} />

            <div className={styleMr(styles.text, styles.currentText)}>{this.props.order.markPrice.format()}</div>

            <div className={styleMr(styles.text3, styles.currentText)}>
              <I18n id={'trade-current-price-short'} textUpper={'uppercase'} />
            </div>
          </div>
        </Resize>
      </div>
    );
  }
}
