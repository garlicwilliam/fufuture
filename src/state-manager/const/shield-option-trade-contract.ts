import { BaseContractManager } from './base-contract-manager';
import {
  SHIELD_OPTION_TRADE_ADDRESS,
  SHIELD_OPTION_TRADE_CONFIG_KEYS,
  ShieldOptionTradeConfigField,
} from '../../components/shield-option-trade/const/shield-option-address';
import { Network } from '../../constant/network';
import { SHIELD_OPTION_TRADE_ABI } from '../../components/shield-option-trade/const/shield-option-abi';
import { IndexUnderlyingType } from '../../components/shield-option-trade/const/assets';
import { isObservable, Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

export class ShieldOptionTradeContracts extends BaseContractManager<ShieldOptionTradeConfigField> {
  constructor() {
    super();
  }

  getConfigContractNames(): readonly ShieldOptionTradeConfigField[] {
    return SHIELD_OPTION_TRADE_CONFIG_KEYS;
  }

  getContractAbi(contractName: ShieldOptionTradeConfigField): any[] {
    return SHIELD_OPTION_TRADE_ABI[contractName];
  }

  getContractAddress(network: Network, contractName: ShieldOptionTradeConfigField): string | undefined {
    const config = SHIELD_OPTION_TRADE_ADDRESS[network];
    if (config) {
      return config[contractName];
    }

    return undefined;
  }

  watchUnderlyingAddress(indexUnderlying: IndexUnderlyingType | Observable<IndexUnderlyingType>): Observable<string> {
    const underlying: Observable<IndexUnderlyingType> = isObservable(indexUnderlying)
      ? indexUnderlying
      : of(indexUnderlying);

    return underlying.pipe(
      switchMap(name => {
        const cName = ('underlying' + name) as ShieldOptionTradeConfigField;
        return this.watchContractAddress(cName).pipe(map(address => address.address));
      })
    );
  }
}

export const shieldOptionTradeContracts = new ShieldOptionTradeContracts();
