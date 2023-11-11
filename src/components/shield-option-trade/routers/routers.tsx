import { Router } from '@remix-run/router';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { ShieldOptionTrade } from '../layout';
import { prefixPath } from '../../common/utils/location-wrapper';
import { RouteKey } from '../../../constant/routes';
import { TradePools } from '../pages/pools/cards/pools';
import { OptionTrade } from '../pages/trade/trade';
import { PrivatePool } from '../pages/pools/private/private-pool';
import { TradePoolHome } from '../pages/pools/pool-index';
import { PublicPool } from '../pages/pools/public/public-pool';
import { TradeReferral } from '../pages/referral/referral';
import { TradeNotFound } from '../pages/not-found';
import { RefRedirect } from '../pages/redirect';
import { ShareOrderMobile } from '../pages/share/share-order-mobile';

const router: Router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={prefixPath} />,
    errorElement: <TradeNotFound />,
  },
  {
    path: prefixPath,
    element: <ShieldOptionTrade />,
    children: [
      {
        path: '',
        element: <Navigate to={RouteKey.trade} />,
      },
      {
        path: RouteKey.trade,
        element: <OptionTrade />,
      },
      {
        path: RouteKey.pools,
        element: <TradePoolHome />,
        children: [
          {
            index: true,
            element: <TradePools />,
          },
          {
            path: RouteKey.sub_PoolsPrivate,
            element: <PrivatePool />,
          },
          {
            path: RouteKey.sub_PoolsPublic,
            element: <PublicPool />,
          },
        ],
      },
      {
        path: RouteKey.referral,
        element: <TradeReferral />,
      },
      {
        path: RouteKey.r,
        element: <RefRedirect />,
      },
      {
        path: RouteKey.poster + '/:oid',
        element: <ShareOrderMobile />,
      },
    ],
  },
]);

const elements = (
  <>
    <RouterProvider router={router} />
  </>
);

export default elements;
