import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import styles from './share-popup.module.less';
import ModalRender from '../../../modal-render';
import { I18n } from '../../../i18n/i18n';
import { ShieldOrderInfo } from '../../../../state-manager/state-types';
import { Poster } from './poster';
import QRCode from 'qrcode.react';
import { SldButton } from '../../../common/buttons/sld-button';
import { bindStyleMerger, cssPick, styleMerge } from '../../../../util/string';
import { fontCss } from '../../../i18n/font-switch';
import React from 'react';
import { RouteKey } from '../../../../constant/routes';
import { prefixPath } from '../../../common/utils/location-wrapper';
import { Visible } from '../../../builtin/hidden';
import { genShareUrl } from './share-url';

type IState = {
  isMobile: boolean;
  isVisible: boolean;
  curOrder: ShieldOrderInfo | null;
};
type IProps = {};

export class SharePopup extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isVisible: false,
    curOrder: null,
  };

  private poster: React.RefObject<Poster> = React.createRef();

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('isVisible', P.Option.Trade.ShareOrder.Visible);
    this.registerState('curOrder', P.Option.Trade.ShareOrder.CurOrder);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  hide() {
    P.Option.Trade.ShareOrder.Visible.set(false);
  }

  onDownload() {
    this.poster.current?.download();
  }

  qrUrl(): string {
    if (this.state.curOrder) {
      return genShareUrl(this.state.curOrder.id, this.state.curOrder.token.network);
    }

    return '';
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const forceWidth = this.state.isMobile ? Math.min(window.innerWidth - 32, 400) : undefined;

    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-share-your-order'} />}
        visible={this.state.isVisible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
        className={styleMerge(styles.shareModal, cssPick(this.state.isMobile, styles.mobile))}
        banDrawer={true}
        maskStyle={{ backgroundColor: this.state.isMobile ? '#000000' : undefined }}
      >
        {this.state.curOrder ? (
          <Poster
            forceWidth={this.state.isMobile ? forceWidth : undefined}
            ref={this.poster}
            curOrder={this.state.curOrder}
          />
        ) : (
          <></>
        )}
        <Visible when={!this.state.isMobile}>
          <div className={styleMr(styles.foot)}>
            <div className={styles.qr}>
              <QRCode size={80} value={this.qrUrl()} />
              <div className={styleMerge(styles.desc, fontCss.medium)}>
                <I18n id={'trade-share-qr-desc'} />
              </div>
            </div>

            <div className={styles.down}>
              <SldButton size={'large'} type={'primary'} className={styles.btn} onClick={() => this.onDownload()}>
                <I18n id={'trade-download'} textUpper={'uppercase'} />
              </SldButton>
            </div>
          </div>
        </Visible>
      </ModalRender>
    );
  }
}
