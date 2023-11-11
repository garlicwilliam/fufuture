import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../util/string';
import styles from './pair-label.module.less';
import { ShieldTradePair } from '../../../../state-manager/state-types';
import { isSameAddress } from '../../../../util/address';
import { tap } from 'rxjs/operators';
import { fontCss } from '../../../i18n/font-switch';
import { iconSize, iconSizeBig, iconFontSize, iconFontSizeBig, iconSizeTiny, iconFontSizeTiny } from '../../const/imgs';
import { TokenIndex } from './token-index';
import { tokenCacheService } from '../../services/token-cache.service';
import { Visible } from '../../../builtin/hidden';
import { IndexUnderlyingIcon } from './index-underlying-icon';
import { TokenIcon } from './token-icon';

type IState = {
  isMobile: boolean;
  tokenIcon: string | undefined;
};

type IProps = {
  pair: ShieldTradePair;
  size?: 'small' | 'large' | 'tiny';
  hideName?: boolean;
  hideIcon?: boolean;
  useOverlap?: boolean;
  align?: 'center' | 'left' | 'right';
};

function px(num: number): string {
  return num + 'px';
}

export class PairLabel extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    tokenIcon: '',
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.updateIcon();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (!isSameAddress(this.props.pair.quoteToken?.address || '', prevProps.pair.quoteToken?.address || '')) {
      this.updateIcon();
    }
  }

  private genSize(): { iconIndex: number; iconQuote: number; font: number } {
    return this.props.size === 'small'
      ? { iconIndex: iconSize, iconQuote: this.props.useOverlap ? iconSize / 1.7 : iconSize, font: iconFontSize }
      : this.props.size === 'tiny'
      ? {
          iconIndex: iconSizeTiny,
          iconQuote: this.props.useOverlap ? iconSizeTiny / 1.7 : iconSizeTiny,
          font: iconFontSizeTiny,
        }
      : {
          iconIndex: iconSizeBig,
          iconQuote: this.props.useOverlap ? iconSizeBig / 1.7 : iconSizeBig,
          font: iconFontSizeBig,
        };
  }

  updateIcon() {
    const icon$ = tokenCacheService.getTokenIcon(this.props.pair.quoteToken).pipe(
      tap(icon => {
        this.updateState({ tokenIcon: icon || undefined });
      })
    );

    this.subOnce(icon$);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const size = this.genSize();
    const alignCss = this.props.align === 'left' ? styles.left : this.props.align === 'right' ? styles.right : '';

    return (
      <div className={styleMr(styles.wrapperPair, alignCss)}>
        <Visible when={!this.props.hideIcon}>
          <div className={styleMr(styles.icons, cssPick(this.props.useOverlap, styles.useOver))}>
            <IndexUnderlyingIcon size={size.iconIndex} indexUnderlying={this.props.pair.indexUnderlying} />

            <div className={styleMr(cssPick(this.props.useOverlap, styles.iconOver))}>
              <TokenIcon size={size.iconQuote} token={this.props.pair.quoteToken} />
            </div>
          </div>
        </Visible>

        <Visible when={!this.props.hideName}>
          <div className={styleMr(styles.name, styles.line1, fontCss.boldLatin)} style={{ fontSize: size.font + 'px' }}>
            <TokenIndex token={this.props.pair.indexUnderlying} /> - {this.props.pair.quoteToken.symbol}
          </div>
        </Visible>
      </div>
    );
  }
}
