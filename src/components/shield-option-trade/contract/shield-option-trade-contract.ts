import { BaseContractManager, ContractAddress } from '../../../state-manager/const/base-contract-manager';
import { SHIELD_OPTION_TRADE_CONFIG_KEYS, ShieldOptionTradeField } from '../const/shield-option-address';
import { Network } from '../../../constant/network';
import { ABI_CHAIN_LINK, ABI_UNDERLYING_ASSET, SHIELD_OPTION_TRADE_ABI } from '../const/shield-option-abi';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { SLD_ENV_CONF } from '../const/env';
import { ShieldUnderlyingType } from '../../../state-manager/state-types';
import { UnderlyingContract, UnderlyingContractAddress } from './shield-contract-types';
import { Contract } from 'ethers';

export class ShieldOptionTradeContracts extends BaseContractManager<ShieldOptionTradeField> {
  constructor() {
    super();
  }

  getConfigContractNames(): readonly ShieldOptionTradeField[] {
    return SHIELD_OPTION_TRADE_CONFIG_KEYS;
  }

  getContractAbi(contractName: ShieldOptionTradeField): any[] {
    return SHIELD_OPTION_TRADE_ABI[contractName];
  }

  getContractAddress(network: Network, contractName: ShieldOptionTradeField): string | undefined {
    const config = SLD_ENV_CONF.Supports[network]?.Addresses.trade;
    if (config) {
      return config[contractName];
    }

    return undefined;
  }
}

export const shieldOptionTradeContracts = new ShieldOptionTradeContracts();

// ---------------------------------------------------------------------------------------------------------------------

export class ShieldUnderlyingContracts extends BaseContractManager<ShieldUnderlyingType> {
  getConfigContractNames(): ShieldUnderlyingType[] {
    return Object.values(ShieldUnderlyingType);
  }

  getContractAbi(contractName: ShieldUnderlyingType): any[] {
    return ABI_UNDERLYING_ASSET;
  }

  getContractAddress(network: Network, contractName: ShieldUnderlyingType): string | undefined {
    return SLD_ENV_CONF.Supports[network]?.Addresses.underlying[contractName];
  }

  watchAddress(underlying$: Observable<ShieldUnderlyingType>): Observable<UnderlyingContractAddress> {
    return underlying$.pipe(
      switchMap((name: ShieldUnderlyingType) => {
        return this.watchContractAddress(name).pipe(
          map((address: ContractAddress) => {
            return Object.assign(address, { underlying: name });
          })
        );
      })
    );
  }

  watchCurContract(underlying$: Observable<ShieldUnderlyingType>): Observable<UnderlyingContract> {
    return underlying$.pipe(
      switchMap((name: ShieldUnderlyingType) => {
        return this.watchContract(name).pipe(
          map((contract: Contract) => {
            return { contract, underlying: name };
          })
        );
      })
    );
  }
}

export const shieldUnderlyingContracts = new ShieldUnderlyingContracts();

// ---------------------------------------------------------------------------------------------------------------------

export class ShieldOracleContracts extends BaseContractManager<ShieldUnderlyingType> {
  getConfigContractNames(): ShieldUnderlyingType[] {
    return Object.values(ShieldUnderlyingType);
  }

  getContractAbi(contractName: ShieldUnderlyingType): any[] {
    return ABI_CHAIN_LINK;
  }

  getContractAddress(network: Network, contractName: ShieldUnderlyingType): string | undefined {
    return SLD_ENV_CONF.Supports[network]?.Oracles[contractName]?.address;
  }
}

export const shieldOracleContracts = new ShieldOracleContracts();
