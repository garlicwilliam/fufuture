import {EthereumProviderName} from "./define";

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export type EthereumProviderInterface = {
  request: (args: RequestArguments) => Promise<any>;
  on: (event: string, callback: Function) => void;
  removeListener: (event: string, callback: Function) => void;
  isConnected: () => boolean;
  close?: () => void;
};

export enum EthereumSpecifyMethod {
  Auto = 'auto',
  User = 'user',
}

export type EthereumProviderState = {
  name: EthereumProviderName;
  instance: EthereumProviderInterface;
  specifyMethod: EthereumSpecifyMethod;
};

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EthereumProviderInterface;
}

export interface EIP6963AnnounceProviderEvent {
  type: 'eip6963:announceProvider';
  detail: EIP6963ProviderDetail;
}

export interface EIP6963RequestProviderEvent extends Event {
  type: 'eip6963:requestProvider';
}
