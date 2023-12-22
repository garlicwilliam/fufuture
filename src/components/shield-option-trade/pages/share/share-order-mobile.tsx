import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import styles from './share-order-mobile.module.less';
import { Poster } from './poster';
import { LocationProps, withLocation, EmptyProps } from '../../../common/utils/location-wrapper';
import * as _ from 'lodash';
import { shieldOrderService } from '../../services/shield-order.service';
import { ShieldOrderInfo } from '../../../../state-manager/state-types';
import { of, switchMap, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { computeOrderPnl } from '../../utils/compute';
import { ShieldLoading } from '../common/loading';
import { FixPadding } from '../../../common/content/fix-padding';
import { SldButton } from '../../../common/buttons/sld-button';
import { I18n } from '../../../i18n/i18n';
import '../../../shield-option-common/css/font-family.less';
import { styleMerge } from '../../../../util/string';
import { fontCss } from '../../../i18n/font-switch';
import React from 'react';
import { NET_BNB, Network } from '../../../../constant/network';

type IState = {
  isMobile: boolean;
  order: ShieldOrderInfo | null;
  width: number;
};
type IProps = {} & LocationProps & EmptyProps;

export class ShareOrderMobileImp extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    order: null,
    width: 0,
  };

  private poster: React.RefObject<Poster> = React.createRef();

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.loadOrder();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (!_.isEqual(this.props.param, prevProps.param)) {
      this.loadOrder();
    }
  }

  loadOrder() {
    const orderId = this.props.param['oid'];
    const network: Network = (this.props.param['nid'] as Network) || NET_BNB;

    const orderIdNum = Math.floor(Number(orderId));

    const order$ = shieldOrderService.getOrderByHttpRpc(orderIdNum, network).pipe(
      switchMap((order: ShieldOrderInfo | null) => {
        const price$ = order ? shieldOrderService.getOrderAssetsPrice(order.indexUnderlying, network) : of(null);
        return zip(of(order), price$);
      }),
      map(([order, price]) => {
        if (!order || !price) {
          return null;
        }

        order.markPrice = price;
        order.pnl = computeOrderPnl(order);

        return order;
      }),
      tap((order: ShieldOrderInfo | null) => {
        this.updateState({ order });
      })
    );

    this.subOnce(order$);
  }

  onDownload() {
    this.poster.current?.download();
  }

  render() {
    const dw = Math.min(window.innerWidth - 32, 480);

    return (
      <div className={styleMerge(styles.wrapper, fontCss.bold)}>
        {this.state.order ? (
          <div className={styles.page}>
            <Poster forceWidth={dw} curOrder={this.state.order} ref={this.poster} />

            <SldButton size={'small'} type={'primary'} className={styles.btn} onClick={() => this.onDownload()}>
              <I18n id={'trade-download'} textUpper={'uppercase'} />
            </SldButton>
          </div>
        ) : this.props.param['oid'] ? (
          <FixPadding top={40} bottom={0} mobTop={40} mobBottom={0}>
            <ShieldLoading size={40} />
          </FixPadding>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export const ShareOrderMobile = withLocation(ShareOrderMobileImp);
