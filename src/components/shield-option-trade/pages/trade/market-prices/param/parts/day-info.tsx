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
import { map } from 'rxjs/operators';
import {
  ShieldOpenInterest,
  ShieldUnderlyingType,
  TokenPriceHistory,
} from '../../../../../../../state-manager/state-types';
import { PendingHolder } from '../../../../../../common/progress/pending-holder';
import { Network } from '../../../../../../../constant/network';
import { walletState } from '../../../../../../../state-manager/wallet/wallet-state';

type IState = {
  isMobile: boolean;
  dayPriceChange: SldDecPercent;
  dayPriceRange: TokenPriceHistory | undefined;
  dayVolume: SldDecimal;
  openInterest: ShieldOpenInterest | undefined;
  indexUnderlying: ShieldUnderlyingType;
  network: Network | null;
};
type IProps = {
  layout: 'narrow' | 'mobile' | 'normal';
  className?: string;
};

export class DayInfo extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    dayPriceChange: SldDecPercent.ZERO,
    dayPriceRange: undefined,
    dayVolume: SldDecimal.ZERO,
    openInterest: undefined,
    indexUnderlying: P.Option.Trade.Pair.Base.get(),
    network: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('network', walletState.NETWORK);
    this.registerState('dayPriceChange', D.Option.Price24hChange);
    this.registerState('dayPriceRange', D.Option.Price24hRange);
    this.registerState('indexUnderlying', P.Option.Trade.Pair.Base);
    this.registerObservable('dayVolume', D.Option.Volume24h.watch().pipe(map(v => v.total)));
    this.registerState('openInterest', D.Option.OpenInterest);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  gen24ChangeVertical(styleMr: StyleMerger): ReactNode {
    const isIncrease: boolean = this.state.dayPriceChange.gtZero();
    const isDecrease: boolean = this.state.dayPriceChange.lt(SldDecPercent.ZERO);

    return (
      <VerticalItem label={<I18n id={'trade-24h-change'} />} gap={'6px'} labelClassName={styleMr(styles.itemLabel)}>
        <span
          className={styleMr(styles.itemLine1, cssPick(isIncrease, 'longStyle'), cssPick(isDecrease, 'shortStyle'))}
        >
          {this.state.dayPriceChange.percentFormat({ sign: true })}%
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
          {this.state.dayPriceChange.percentFormat({ sign: true })}%
        </span>
      </HorizonItem>
    );
  }

  gen24VolumeVertical(styleMr: StyleMerger): ReactNode {
    return (
      <VerticalItem label={<I18n id={'trade-24h-volume'} />} gap={'6px'} labelClassName={styleMr(styles.itemLabel)}>
        <TokenAmountInline
          amount={this.state.dayVolume}
          token={this.state.indexUnderlying}
          numClassName={styleMr(styles.itemValue)}
          symClassName={styleMr(styles.itemLabel)}
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

  genMinPriceVertical(styleMr: StyleMerger): ReactNode {
    const isCorrect = this.state.indexUnderlying === this.state.dayPriceRange?.underlying;

    return (
      <VerticalItem
        label={<I18n id={'trade-24h-price-low'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemValue)}
      >
        <PendingHolder loading={!isCorrect} useIcon={true}>
          <TokenAmountInline
            amount={this.state.dayPriceRange?.minPrice}
            token={'USD'}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
      </VerticalItem>
    );
  }

  genMinPriceHorizon(styleMr: StyleMerger): ReactNode {
    const isCorrect = this.state.indexUnderlying === this.state.dayPriceRange?.underlying;

    return (
      <HorizonItem
        label={<I18n id={'trade-24h-price-low'} />}
        align={'justify'}
        separator={<span style={{ display: 'inline-block', padding: '0 8px' }}>&nbsp;</span>}
        labelClass={styleMr(styles.label)}
        valueClass={styleMr(styles.value)}
      >
        <PendingHolder loading={!isCorrect} useIcon={true} width={80}>
          <TokenAmountInline
            amount={this.state.dayPriceRange?.minPrice}
            token={'USD'}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
      </HorizonItem>
    );
  }

  genMaxPriceVertical(styleMr: StyleMerger): ReactNode {
    const isCorrect = this.state.indexUnderlying === this.state.dayPriceRange?.underlying;

    return (
      <VerticalItem
        label={<I18n id={'trade-24h-price-high'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemValue)}
      >
        <PendingHolder loading={!isCorrect} useIcon={true}>
          <TokenAmountInline
            amount={this.state.dayPriceRange?.maxPrice}
            token={'USD'}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
      </VerticalItem>
    );
  }

  genMaxPriceHorizon(styleMr: StyleMerger): ReactNode {
    const isCorrect = this.state.indexUnderlying === this.state.dayPriceRange?.underlying;

    return (
      <HorizonItem
        label={<I18n id={'trade-24h-price-high'} />}
        align={'justify'}
        separator={<span style={{ display: 'inline-block', padding: '0 8px' }}>&nbsp;</span>}
        labelClass={styleMr(styles.label)}
        valueClass={styleMr(styles.value)}
      >
        <PendingHolder loading={!isCorrect} useIcon={true}>
          <TokenAmountInline
            amount={this.state.dayPriceRange?.maxPrice}
            token={'USD'}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
      </HorizonItem>
    );
  }

  genOpenInterestVertical(styleMr: StyleMerger): ReactNode {
    const isCorrect: boolean =
      this.state.indexUnderlying === this.state.openInterest?.underlying &&
      this.state.network === this.state.openInterest.network;

    return (
      <VerticalItem
        label={<I18n id={'trade-open-interest'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemValue)}
      >
        <PendingHolder loading={!isCorrect} width={80} useIcon={true}>
          <TokenAmountInline
            amount={this.state.openInterest?.amount}
            token={this.state.indexUnderlying}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
      </VerticalItem>
    );
  }

  genOpenInterestHorizon(styleMr: StyleMerger): ReactNode {
    const isCorrect: boolean =
      this.state.indexUnderlying === this.state.openInterest?.underlying &&
      this.state.network === this.state.openInterest.network;

    return (
      <HorizonItem
        label={<I18n id={'trade-open-interest'} />}
        align={'justify'}
        separator={<span style={{ display: 'inline-block', padding: '0 8px' }}>&nbsp;</span>}
        labelClass={styleMr(styles.label)}
        valueClass={styleMr(styles.value)}
      >
        <PendingHolder loading={!isCorrect} width={80} useIcon={true}>
          <TokenAmountInline
            amount={this.state.openInterest?.amount}
            token={this.state.indexUnderlying}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
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

    return isMobile ? (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeHorizon(styleMr)}
        {this.gen24VolumeHorizon(styleMr)}
        {this.genMinPriceHorizon(styleMr)}
        {this.genMaxPriceHorizon(styleMr)}
        {this.genOpenInterestHorizon(styleMr)}
      </div>
    ) : (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeVertical(styleMr)}
        {this.gen24VolumeVertical(styleMr)}
        {this.genMinPriceVertical(styleMr)}
        {this.genMaxPriceVertical(styleMr)}
        {this.genOpenInterestVertical(styleMr)}
      </div>
    );
  }
}
