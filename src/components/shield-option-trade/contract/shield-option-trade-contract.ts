import { BaseContractManager } from '../../../state-manager/const/base-contract-manager';
import {
  SHIELD_OPTION_TRADE_CONFIG_KEYS,
  ShieldOptionTradeConfigField,
} from '../const/shield-option-address';
import { Network } from '../../../constant/network';
import { SHIELD_OPTION_TRADE_ABI } from '../const/shield-option-abi';
import { isObservable, Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { SLD_ENV_CONF } from '../const/env';
import {ShieldUnderlyingType} from "../../../state-manager/state-types";

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
    const config = SLD_ENV_CONF.Addresses;
    if (config) {
      return config[contractName];
    }

    return undefined;
  }

  watchUnderlyingAddress(indexUnderlying: ShieldUnderlyingType | Observable<ShieldUnderlyingType>): Observable<string> {
    const underlying: Observable<ShieldUnderlyingType> = isObservable(indexUnderlying)
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
