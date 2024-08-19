import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { JsonRpcProvider } from '@uniswap/widgets';
import { rpcProviderGetter } from '../../../constant/chain-rpc';
import { NET_B2, NET_ETHEREUM, NET_MANTA_PACIFIC } from '../../../constant/network';
import { BigNumber, Contract, ethers } from 'ethers';
import { createChainContract } from '../../../state-manager/const/contract-creator';
import { BridgeAbi, layerBankAbi } from '../const/abis';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { SldDecimal } from '../../../util/decimal';
import { E18 } from '../../../constant';
import { httpGet } from '../../../util/http';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { SldButton } from '../../common/buttons/sld-button';
import { decode, fromBase64 } from 'js-base64';
import { isValidAddress } from '../../../util/address';
import {base64} from "ethers/lib/utils";

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
    const provider = rpcProviderGetter(NET_ETHEREUM)!;
    const contract: Contract = new Contract('0x1b70Ff1e5152FDb8425A2B84b098DF2F9C1DF54E', BridgeAbi, provider);

    const bridgeAmount = SldDecimal.fromNumeric('0.0001', 18);
    const fromAddr = '0x9683b75853394B4D664256Fdba643D651926c857';

    type Rs = { nativeFee: BigNumber; zroFee: BigNumber };

    from(contract.estimateSendFee(bridgeAmount.toOrigin(), fromAddr) as Promise<Rs>)
      .pipe(
        switchMap((fee: Rs) => {
          const nFee = fee.nativeFee;
          return from(
            contract.populateTransaction.bridgeTo(bridgeAmount.toOrigin(), fromAddr, nFee, {
              value: nFee.add(bridgeAmount.toOrigin()),
            })
          );
        }),
        map(tx => {
          return ethers.utils.serializeTransaction(tx);
        }),
        map(transaction => {
          const code =
            'AvjKgICAgICUG3D/HlFS/bhCWiuEsJjfL5wd9U6IHSX5FYMN14i4pIuIa/IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdJLLfrFIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFGNda714gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFJaDt1hTOUtNZkJW/bpkPWUZJshXAAAAAAAAAAAAAAAAwA==';
         // const txStr =
          //  '0x02f8ca8080808080941b70ff1e5152fdb8425a2b84b098df2f9c1df54e881d25f915830dd788b8a48b886bf20000000000000000000000000000000000000000000000001d24b2dfac520000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000014635d6bbd78800000000000000000000000000000000000000000000000000000000000000149683b75853394b4d664256fdba643d651926c857000000000000000000000000c0'; //fromBase64(code);

          const txStr = base64.decode(code)

          console.log('txStr', txStr);
          return ethers.utils.parseTransaction(txStr);
        }),
        map(ptx => {
          console.log('ptx', ptx);

          const isValid = isValidAddress(ptx.to);
          console.log('is address valid', String(isValid));
          const fromAddress: string = '0x9683b75853394B4D664256Fdba643D651926c857';

          return from(
            window['ethereum'].request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: fromAddress,
                  to: ptx.to,
                  value: ptx.value.toHexString(),
                  data: ptx.data,
                  gas: BigNumber.from('955543').toHexString(),
                },
              ],
            })
          );
        })
      )
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
