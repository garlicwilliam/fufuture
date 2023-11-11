import { EthereumProviderName } from '../constant';

export type EthereumProviderInterface = {
  request: (obj: any) => Promise<any>;
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
