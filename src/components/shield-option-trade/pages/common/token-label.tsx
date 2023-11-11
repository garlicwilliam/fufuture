import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../util/string';
import styles from './token-label.module.less';
import { TokenErc20 } from '../../../../state-manager/state-types';
import { iconFontSize, iconFontSizeBig, iconFontSizeTiny, iconSize, iconSizeBig, iconSizeTiny } from '../../const/imgs';
import { fontCss } from '../../../i18n/font-switch';
import { tokenCacheService } from '../../services/token-cache.service';
import { tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { TokenIcon } from './token-icon';
import CopyToClipboard from 'react-copy-to-clipboard';
import { message } from 'antd';
import { I18n } from '../../../i18n/i18n';
import { Visible } from '../../../builtin/hidden';
import { Copy } from '../../../common/svg/copy';

type IState = {
  isMobile: boolean;
  tokenIcon: string | undefined;
};
type IProps = {
  token: TokenErc20;
  size: 'small' | 'large' | 'tiny';
  align?: 'left' | 'right' | 'center';
  useCopy?: boolean;
};

export class TokenLabel extends BaseStateComponent<IProps, IState> {
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
    if (!_.isEqual(this.props.token, prevProps.token)) {
      this.updateIcon();
    }
  }

  updateIcon() {
    this.subOnce(
      tokenCacheService.getTokenIcon(this.props.token).pipe(
        tap((icon: string | null) => {
          this.updateState({ tokenIcon: icon || undefined });
        })
      )
    );
  }

  private genSize(): { icon: number; font: number } {
    return this.props.size === 'small'
      ? { icon: iconSize, font: iconFontSize }
      : this.props.size === 'tiny'
      ? { icon: iconSizeTiny, font: iconFontSizeTiny }
      : { icon: iconSizeBig, font: iconFontSizeBig };
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const size = this.genSize();
    const alignCss =
      this.props.align === 'left'
        ? styles.left
        : this.props.align === 'center'
        ? styles.center
        : this.props.align === 'right'
        ? styles.right
        : styles.left;

    return (
      <div className={styleMr(styles.wrapperLabel, alignCss)}>
        <TokenIcon size={size.icon} token={this.props.token} />

        <div
          className={styleMr(styles.name, cssPick(this.props.size !== 'tiny', fontCss.boldLatin))}
          style={{ fontSize: size.font + 'px' }}
        >
          {this.props.token.symbol}
        </div>

        <Visible when={!!this.props.useCopy}>
          <div
            className={styleMr(styles.copy)}
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
            }}
          >
            <CopyToClipboard text={this.props.token.address} onCopy={() => message.success(<I18n id={'com-copied'} />)}>
              <div className={styleMr(styles.icon)}>
                <Copy />
              </div>
            </CopyToClipboard>
          </div>
        </Visible>
      </div>
    );
  }
}
