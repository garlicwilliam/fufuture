import { ContractAddress } from '../../../state-manager/const/base-contract-manager';
import { ShieldUnderlyingType } from '../../../state-manager/state-types';
import { Contract } from 'ethers';

export type UnderlyingContractAddress = ContractAddress & { underlying: ShieldUnderlyingType };
export type UnderlyingContract = { contract: Contract; underlying: ShieldUnderlyingType };
