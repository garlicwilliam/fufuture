import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { TextBtn } from '../../../common/buttons/text-btn';
import { I18n } from '../../../i18n/i18n';
import { ShieldOrderInfo } from '../../../../state-manager/state-types';
import { SldButton } from '../../../common/buttons/sld-button';
import styles from './share.module.less';
import { bindStyleMerger, styleMerge, StyleMerger } from '../../../../util/string';
import { IconDropdown } from '../../../common/icon/dropdown';
import { SldOverlay, TriggerEvent } from '../../../common/overlay/overlay';
import { ReactNode } from 'react';
import { prefixPath } from '../../../common/utils/location-wrapper';
import { RouteKey } from '../../../../constant/routes';
import { message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { genShareUrl } from './share-url';

type IState = {
  isMobile: boolean;
  isVisible: boolean;
  overlayHideEvent: TriggerEvent | undefined;
};
type IProps = {
  className?: string;
  order: ShieldOrderInfo;
  isText?: boolean;
};

export class ShareOrder extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isVisible: false,
    overlayHideEvent: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClick() {
    P.Option.Trade.ShareOrder.CurOrder.set(this.props.order);
    P.Option.Trade.ShareOrder.Visible.set(true);
  }

  genSelectOverlay(styleMr: StyleMerger): ReactNode {
    const shareUrl = genShareUrl(this.props.order.id, this.props.order.token.network);

    return (
      <div className={styleMr(styles.shareOverlay)}>
        <div className={styleMr(styles.shareOverlayItem)} onClick={this.onClick.bind(this)}>
          <I18n id={'trade-share-shot-desc'} />
        </div>
        <div className={styleMr(styles.shareOverlayItem)}>
          <CopyToClipboard
            text={shareUrl}
            onCopy={() => {
              message.success(<I18n id={'com-copied'} />);
              this.updateState({ overlayHideEvent: { action: 'hide', date: new Date() } });
            }}
          >
            <div>
              <I18n id={'trade-share-copy-url-desc'} />
            </div>
          </CopyToClipboard>
        </div>
      </div>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const isText: boolean = this.props.isText === undefined ? true : this.props.isText;

    return isText ? (
      <TextBtn className={this.props.className} onClick={this.onClick.bind(this)}>
        <I18n id={'trade-share'} textUpper={'uppercase'} />
      </TextBtn>
    ) : (
      <SldOverlay
        overlay={this.genSelectOverlay(styleMr)}
        placement={'bottom-end'}
        useArrow={false}
        offset={4}
        forceTriggerEvent={this.state.overlayHideEvent}
      >
        <SldButton size={'tiny'} type={'none'} className={styleMerge(styles.btnOutline, this.props.className)}>
          <I18n id={'trade-share'} textUpper={'uppercase'} />
          &nbsp;
          <IconDropdown width={10} />
        </SldButton>
      </SldOverlay>
    );
  }
}
