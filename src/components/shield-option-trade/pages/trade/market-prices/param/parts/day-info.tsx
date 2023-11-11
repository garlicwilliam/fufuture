import { BaseStateComponent } from '../../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, StyleMerger } from '../../../../../../../util/string';
import styles from './day-info.module.less';
import { VerticalItem } from '../../../../../../common/content/vertical-item';
import { I18n } from '../../../../../../i18n/i18n';
import { TokenAmountInline } from '../../../../../../common/content/token-amount-inline';
import { SldDecimal, SldDecPercent } from '../../../../../../../util/decimal';
import { ReactNode } from 'react';
import { HorizonItem } from '../../../../../../common/content/horizon-item';
import { D } from '../../../../../../../state-manager/database/database-state-parser';
import { IndexUnderlyingType } from '../../../../../const/assets';

type IState = {
  isMobile: boolean;
  dayPriceChange: SldDecPercent;
  dayVolume: SldDecimal;
  indexUnderlying: IndexUnderlyingType;
};
type IProps = {
  layout: 'narrow' | 'mobile' | 'normal';
  className?: string;
};

export class DayInfo extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    dayPriceChange: SldDecPercent.ZERO,
    dayVolume: SldDecimal.ZERO,
    indexUnderlying: P.Option.Trade.Pair.Base.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('dayPriceChange', D.Option.Price24hChange);
    this.registerState('indexUnderlying', P.Option.Trade.Pair.Base);
    this.registerState('dayVolume', D.Option.Volume24h);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  gen24ChangeVertical(styleMr: StyleMerger): ReactNode {
    return (
      <VerticalItem label={<I18n id={'trade-24h-change'} />} gap={'10px'} labelClassName={styleMr(styles.label)}>
        <span
          className={styleMr(
            styles.line1,
            cssPick(this.state.dayPriceChange.gtZero(), 'longStyle'),
            cssPick(this.state.dayPriceChange.lt(SldDecPercent.ZERO), 'shortStyle')
          )}
        >
          {this.state.dayPriceChange.percentFormat()}%
        </span>
      </VerticalItem>
    );
  }

  gen24ChangeHorizon(styleMr: StyleMerger): ReactNode {
    return (
      <HorizonItem
        className={styleMr(styles.change)}
        label={<I18n id={'trade-24h-change'} nowrap={true} />}
        align={'justify'}
        separator={<span style={{ display: 'inline-block', padding: '0 8px' }}>&nbsp;</span>}
        labelClass={styleMr(styles.label)}
        valueClass={styleMr(styles.value)}
      >
        <span
          className={styleMr(
            styles.line1,
            cssPick(this.state.dayPriceChange.gtZero(), 'longStyle'),
            cssPick(this.state.dayPriceChange.lt(SldDecPercent.ZERO), 'shortStyle')
          )}
        >
          {this.state.dayPriceChange.percentFormat()}%
        </span>
      </HorizonItem>
    );
  }

  gen24VolumeVertical(styleMr: StyleMerger): ReactNode {
    return (
      <VerticalItem label={<I18n id={'trade-24h-volume'} />} gap={'10px'} labelClassName={styleMr(styles.label)}>
        <TokenAmountInline
          amount={this.state.dayVolume}
          token={this.state.indexUnderlying}
          symClassName={styleMr(styles.label)}
        />
      </VerticalItem>
    );
  }

  gen24VolumeHorizon(styleMr: StyleMerger): ReactNode {
    return (
      <HorizonItem
        className={styleMr(styles.volume)}
        label={<I18n id={'trade-24h-volume'} nowrap={true} />}
        align={'justify'}
        separator={<span style={{ display: 'inline-block', padding: '0 8px' }}>&nbsp;</span>}
        labelClass={styleMr(styles.label)}
        valueClass={styleMr(styles.value)}
      >
        <TokenAmountInline
          amount={this.state.dayVolume}
          token={this.state.indexUnderlying}
          symClassName={styleMr(styles.label)}
        />
      </HorizonItem>
    );
  }

  render() {
    const isNarrow: boolean = this.props.layout === 'narrow';
    const isMobile: boolean = this.props.layout === 'mobile';
    const isNormal: boolean = this.props.layout === 'normal';

    const mobileCss =
      this.props.layout === 'narrow' ? styles.narrow : this.props.layout === 'mobile' ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return isNarrow ? (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeHorizon(styleMr)}
        {this.gen24VolumeHorizon(styleMr)}
      </div>
    ) : isMobile ? (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeHorizon(styleMr)}
        {this.gen24VolumeHorizon(styleMr)}
      </div>
    ) : (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeVertical(styleMr)}
        {this.gen24VolumeVertical(styleMr)}
      </div>
    );
  }
}
