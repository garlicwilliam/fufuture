import { Contract } from 'ethers';
import { from, Observable } from 'rxjs';

export function erc721SymbolGetter(erc721Contract: Contract): Observable<string> {
  return from(erc721Contract.symbol() as Promise<string>);
}

export function erc721IsApprovedAllGetter(
  erc721Contract: Contract,
  owner: string,
  operator: string
): Observable<boolean> {
  return from(erc721Contract.isApprovedForAll(owner, operator) as Promise<boolean>);
}
