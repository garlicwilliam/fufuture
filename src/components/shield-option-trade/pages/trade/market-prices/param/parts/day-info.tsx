import { BaseStateComponent } from '../../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, StyleMerger } from '../../../../../../../util/string';
import styles from './day-info.module.less';
import { VerticalItem } from '../../../../../../common/content/vertical-item';
import { I18n } from '../../../../../../i18n/i18n';
import { TokenAmountInline } from '../../../../../../common/content/token-amount-inline';
import { ReactNode } from 'react';
import { HorizonItem } from '../../../../../../common/content/horizon-item';
import { D } from '../../../../../../../state-manager/database/database-state-parser';
import {
  ShieldOpenInterest,
  ShieldTradingVolume,
  ShieldUnderlyingType,
  TokenPriceHistory,
} from '../../../../../../../state-manager/state-types';
import { PendingHolder } from '../../../../../../common/progress/pending-holder';
import { Network } from '../../../../../../../constant/network';
import { walletState } from '../../../../../../../state-manager/wallet/wallet-state';

type IState = {
  isMobile: boolean;
  dayPriceRange: TokenPriceHistory | undefined;
  dayVolume: ShieldTradingVolume | undefined;
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
    dayPriceRange: undefined,
    dayVolume: undefined,
    openInterest: undefined,
    indexUnderlying: P.Option.Trade.Pair.Base.get(),
    network: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('network', walletState.NETWORK);
    this.registerState('dayPriceRange', D.Option.Price24hRange);
    this.registerState('indexUnderlying', P.Option.Trade.Pair.Base);
    this.registerState('dayVolume', D.Option.Volume24h);
    this.registerState('openInterest', D.Option.OpenInterest);

    this.tickInterval(120000, D.Option.Volume24h, D.Option.OpenInterest, D.Option.Price24hRange);

    // this.tickInterval(60000, D.Option.Price24hRange);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  gen24ChangeVertical(styleMr: StyleMerger): ReactNode {
    const percentage: number = this.state.dayPriceRange?.priceChange || 0;
    const isIncrease: boolean = percentage > 0;
    const isDecrease: boolean = percentage < 0;

    const isLoading: boolean =
      !this.state.dayPriceRange ||
      this.state.dayPriceRange.underlying !== this.state.indexUnderlying ||
      this.state.dayPriceRange.network !== this.state.network;

    return (
      <VerticalItem
        label={<I18n id={'trade-24h-change'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemLine1)}
      >
        <PendingHolder loading={isLoading} width={50}>
          <span
            className={styleMr(styles.itemLine1, cssPick(isIncrease, 'longStyle'), cssPick(isDecrease, 'shortStyle'))}
          >
            {percentage < 0 ? '' : '+'}
            {percentage.toFixed(2)}%
          </span>
        </PendingHolder>
      </VerticalItem>
    );
  }

  gen24ChangeHorizon(styleMr: StyleMerger): ReactNode {
    const percentage = this.state.dayPriceRange?.priceChange || 0;
    const isIncrease: boolean = percentage > 0;
    const isDecrease: boolean = percentage < 0;

    const isLoading: boolean =
      !this.state.dayPriceRange ||
      this.state.dayPriceRange.underlying !== this.state.indexUnderlying ||
      this.state.dayPriceRange.network !== this.state.network;

    return (
      <HorizonItem
        className={styleMr(styles.change)}
        label={<I18n id={'trade-24h-change'} nowrap={true} />}
        align={'justify'}
        separator={<span style={{ display: 'inline-block', padding: '0 8px' }}>&nbsp;</span>}
        labelClass={styleMr(styles.label)}
        valueClass={styleMr(styles.value)}
      >
        <PendingHolder loading={isLoading} width={50} useIcon={true}>
          <span className={styleMr(styles.line1, cssPick(isIncrease, 'longStyle'), cssPick(isDecrease, 'shortStyle'))}>
            {percentage < 0 ? '' : '+'}
            {percentage.toFixed(2)}%
          </span>
        </PendingHolder>
      </HorizonItem>
    );
  }

  gen24VolumeVertical(styleMr: StyleMerger): ReactNode {
    return (
      <VerticalItem
        label={<I18n id={'trade-24h-volume'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemLine1)}
      >
        <PendingHolder
          loading={
            !this.state.dayVolume ||
            this.state.dayVolume.indexUnderlying !== this.state.indexUnderlying ||
            this.state.dayVolume.network !== this.state.network
          }
          width={50}
        >
          <TokenAmountInline
            amount={this.state.dayVolume?.total}
            token={this.state.indexUnderlying}
            numClassName={styleMr(styles.itemValue)}
            symClassName={styleMr(styles.itemLabel)}
          />
        </PendingHolder>
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
        <PendingHolder
          loading={
            !this.state.dayVolume ||
            this.state.dayVolume.indexUnderlying !== this.state.indexUnderlying ||
            this.state.dayVolume.network !== this.state.network
          }
          width={50}
          useIcon={this.props.layout === 'mobile'}
        >
          <TokenAmountInline
            amount={this.state.dayVolume?.total}
            token={this.state.indexUnderlying}
            symClassName={styleMr(styles.label)}
          />
        </PendingHolder>
      </HorizonItem>
    );
  }

  genMinPriceVertical(styleMr: StyleMerger): ReactNode {
    const isCorrect =
      this.state.indexUnderlying === this.state.dayPriceRange?.underlying &&
      this.state.network === this.state.dayPriceRange.network;

    return (
      <VerticalItem
        label={<I18n id={'trade-24h-price-low'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemValue)}
      >
        <PendingHolder loading={!isCorrect} width={50} useIcon={false}>
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
    const isCorrect =
      this.state.indexUnderlying === this.state.dayPriceRange?.underlying &&
      this.state.network === this.state.dayPriceRange.network;

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
    const isCorrect =
      this.state.indexUnderlying === this.state.dayPriceRange?.underlying &&
      this.state.network === this.state.dayPriceRange.network;

    return (
      <VerticalItem
        label={<I18n id={'trade-24h-price-high'} />}
        gap={'6px'}
        labelClassName={styleMr(styles.itemLabel)}
        valueClassName={styleMr(styles.itemValue)}
      >
        <PendingHolder loading={!isCorrect} width={50} useIcon={false}>
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
    const isCorrect =
      this.state.indexUnderlying === this.state.dayPriceRange?.underlying &&
      this.state.network === this.state.dayPriceRange.network;

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
        <PendingHolder loading={!isCorrect} width={50}>
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
    // const isNarrow: boolean = this.props.layout === 'narrow';
    // const isNormal: boolean = this.props.layout === 'normal';
    const isMobile: boolean = this.props.layout === 'mobile';

    const mobileCss =
      this.props.layout === 'narrow' ? styles.narrow : this.props.layout === 'mobile' ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return isMobile ? (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeHorizon(styleMr)}
        {this.genMinPriceHorizon(styleMr)}
        {this.genMaxPriceHorizon(styleMr)}
        {this.gen24VolumeHorizon(styleMr)}
        {this.genOpenInterestHorizon(styleMr)}
      </div>
    ) : (
      <div className={styleMr(styles.wrapperDay, this.props.className)}>
        {this.gen24ChangeVertical(styleMr)}
        {this.genMinPriceVertical(styleMr)}
        {this.genMaxPriceVertical(styleMr)}
        {this.gen24VolumeVertical(styleMr)}
        {this.genOpenInterestVertical(styleMr)}
      </div>
    );
  }
}
