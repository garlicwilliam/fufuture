import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import styles from './share-popup.module.less';
import ModalRender from '../../../modal-render';
import { I18n } from '../../../i18n/i18n';
import { ShieldOrderInfo } from '../../../../state-manager/state-types';
import { Poster } from './poster';
import QRCode from 'qrcode.react';
import { SldButton } from '../../../common/buttons/sld-button';
import { styleMerge } from '../../../../util/string';
import { fontCss } from '../../../i18n/font-switch';
import React from 'react';
import { RouteKey } from '../../../../constant/routes';
import { prefixPath } from '../../../common/utils/location-wrapper';

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

  qrUrl() {
    return window.location.origin + prefixPath + '/' + RouteKey.poster + '/' + this.state.curOrder?.id.toString();
  }

  render() {
    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-share-your-order'} />}
        visible={this.state.isVisible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
        className={styles.shareModal}
      >
        {this.state.curOrder ? <Poster ref={this.poster} curOrder={this.state.curOrder} /> : <></>}

        <div className={styles.foot}>
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
      </ModalRender>
    );
  }
}
