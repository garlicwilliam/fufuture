import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { JsonRpcProvider } from '@uniswap/widgets';
import { rpcProviderGetter } from '../../../constant/chain-rpc';
import { NET_B2, NET_MANTA_PACIFIC } from '../../../constant/network';
import { BigNumber, Contract } from 'ethers';
import { createChainContract } from '../../../state-manager/const/contract-creator';
import { layerBankAbi } from '../const/abis';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { SldDecimal } from '../../../util/decimal';
import { E18 } from '../../../constant';
import { httpGet } from '../../../util/http';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { SldButton } from '../../common/buttons/sld-button';

type IState = {
  isMobile: boolean;
  curUser: string | null;
};
type IProps = {};

export class Layout extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curUser: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('curUser', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  req() {
    const provider = rpcProviderGetter(NET_B2)!;
    const layerBank = createChainContract('0x8b03af6CA293FeE5A64497B8D50A5186a5BEcAA9', layerBankAbi, provider, NET_B2);

    from(layerBank.accountSnapshot('0x5B1AA2490E5a0BF1433DA9a050e9ad798405B3e2'))
      .pipe(map((res: any) => {}))
      .subscribe();
  }

  render(): JSX.Element {
    return (
      <div>
        <SldButton size={'large'} type={'primary'} onClick={() => this.req()}>
          Test
        </SldButton>
      </div>
    );
  }
}
