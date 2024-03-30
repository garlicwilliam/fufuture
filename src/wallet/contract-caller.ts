import * as ethers from 'ethers';
import { BigNumber, Contract } from 'ethers';
import { from, Observable, of, zip } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EMPTY_ADDRESS, ETH_DECIMAL, ZERO } from '../constant';
import { SldDecimal } from '../util/decimal';
import { AbiCoder } from 'ethers/lib/utils';

export class ContractCaller {
  public deposit(contract: Contract, amount: BigNumber, isNative: boolean = false): Observable<boolean> {
    const deposit$ = isNative ? from(contract.deposit({ value: amount })) : from(contract.deposit(amount));
    return this.boolExe(deposit$, 'Deposit Error:');
  }

  public withdraw(contract: Contract, amount: BigNumber): Observable<boolean> {
    return this.boolExe(from(contract.withdraw(amount)), 'Withdraw Error:');
  }

  // -------------------------------------------------------------------------------------------------------------------

  public requestWithdrawStone(stoneVault: Contract, stoneAmount: BigNumber): Observable<boolean> {
    const request$ = from(stoneVault.requestWithdraw(stoneAmount) as Promise<boolean>);
    return this.boolExe(request$, 'Request Error: ');
  }

  public requestWithdrawStoneGas(stoneVault: Contract, stoneAmount: BigNumber): Observable<SldDecimal> {
    const fee$ = from(stoneVault.provider.getFeeData());
    const gas$ = from(stoneVault.estimateGas.requestWithdraw(stoneAmount));

    return zip(fee$, gas$).pipe(
      map(([fee, gas]) => {
        const theGas = fee.maxFeePerGas?.mul(gas) || ZERO;
        return SldDecimal.fromOrigin(theGas, ETH_DECIMAL);
      }),
      catchError(err => {
        console.warn('Estimate Gas Error: ', err);
        return of(SldDecimal.ZERO);
      })
    );
  }

  public cancelRequestWithdraw(stoneVault: Contract, stoneAmount: BigNumber): Observable<boolean> {
    const cancel$ = from(stoneVault.cancelWithdraw(stoneAmount) as Promise<boolean>);
    return this.boolExe(cancel$, 'Cancel Error: ');
  }

  public instantWithdrawStone(stoneVault: Contract, stoneAmount: BigNumber): Observable<boolean> {
    // const withdraw$ = this.increaseGas(stoneVault.estimateGas.instantWithdraw, stoneAmount).pipe(
    //   switchMap(newGas => {
    //     return stoneVault.instantWithdraw(ZERO, stoneAmount, newGas);
    //   })
    // );

    const withdraw$ = from(stoneVault.instantWithdraw(ZERO, stoneAmount) as Promise<BigNumber>);
    return this.boolExe(withdraw$, 'Instant Withdraw Error: ');
  }

  public instantWithdrawStoneEth(stoneVault: Contract, ethAmount: BigNumber): Observable<boolean> {
    // const withdraw$ = this.increaseGas(stoneVault.estimateGas.instantWithdraw, ethAmount).pipe(
    //   switchMap(newGas => {
    //     return stoneVault.instantWithdraw(ethAmount, ZERO, newGas);
    //   })
    // );

    const withdraw$ = from(stoneVault.instantWithdraw(ethAmount, ZERO) as Promise<BigNumber>);
    return this.boolExe(withdraw$, 'Instant Withdraw Error: ');
  }

  public instantWithdrawStoneGas(stoneVault: Contract, stoneAmount: BigNumber): Observable<SldDecimal> {
    return zip(
      from(stoneVault.provider.getFeeData()),
      from(stoneVault.estimateGas.instantWithdraw(ZERO, stoneAmount) as Promise<BigNumber>)
    ).pipe(
      map(([fee, gas]) => {
        const priorityFee: BigNumber = fee!.maxPriorityFeePerGas || ZERO;
        const price = fee.lastBaseFeePerGas!.add(priorityFee);
        const theGas: BigNumber = price.mul(gas) || ZERO;
        return SldDecimal.fromOrigin(theGas!, ETH_DECIMAL);
      })
    );
  }

  public voteForProposal(
    proposalContract: Contract,
    proposalAddress: string,
    voteAmount: BigNumber,
    voteType: boolean
  ): Observable<boolean> {
    const vote$ = from(proposalContract.voteFor(proposalAddress, voteAmount, voteType));
    return this.boolExe(vote$, 'Vote Error: ');
  }

  public retrieveProposalToken(proposalContract: Contract, proposalAddress: string): Observable<boolean> {
    const cancel$ = from(proposalContract.retrieveTokenFor(proposalAddress));
    return this.boolExe(cancel$, 'Retrieve Token Error: ');
  }

  public stoneToNextRound(stoneVault: Contract): Observable<boolean> {
    const settle$ = this.increaseGas(stoneVault.estimateGas.rollToNextRound).pipe(
      switchMap(newGas => {
        return stoneVault.rollToNextRound(newGas);
      })
    );

    //const settle$ = from(stoneVault.rollToNextRound({ gasLimit: BigNumber.from('10000000') }));
    return this.boolExe(settle$, 'Settlement Error: ');
  }

  public createPortfolioProposal(
    proposalContract: Contract,
    strategyAllocation: { strategyAddress: string; strategyAllocation: BigNumber }[]
  ): Observable<boolean> {
    const paramAddress: string[] = [];
    const paramAllocation: BigNumber[] = [];
    strategyAllocation.forEach(one => {
      paramAddress.push(one.strategyAddress);
      paramAllocation.push(one.strategyAllocation);
    });

    const iFace: ethers.utils.Interface = new ethers.utils.Interface([
      'function addStrategy(address)',
      'function updatePortfolioConfig(address[],uint256[])',
    ]);
    const funByte: string = iFace.getSighash('updatePortfolioConfig');

    const abiCoder = new AbiCoder();
    const paramByte: string = abiCoder.encode(['address[]', 'uint256[]'], [paramAddress, paramAllocation]);

    const data: string = funByte + paramByte.substring(2);

    const create$ = from(proposalContract.propose(data));

    return this.boolExe(create$, 'Propose Error: ');
  }

  public executeProposal(proposalContract: Contract, proposalAddress: string): Observable<boolean> {
    const exe$ = from(proposalContract.execProposal(proposalAddress));
    return this.boolExe(exe$, 'Execute Error: ');
  }

  public setProposalPeriod(proposalContract: Contract, period: number): Observable<boolean> {
    const set$ = from(proposalContract.setVotePeriod(period));
    return this.boolExe(set$, 'Set Error: ');
  }

  public stoneBridgeTo(
    stoneContract: Contract,
    amount: BigNumber,
    userAddress: string,
    distChain: number,
    fees: BigNumber
  ): Observable<string> {
    const send$ = from(
      stoneContract.sendFrom(userAddress, distChain, userAddress, amount, userAddress, EMPTY_ADDRESS, '0x', {
        value: fees,
      })
    );

    return this.txHashExe(send$, 'Bridge Error: ');
  }

  // -------------------------------------------------------------------------------------------------------------------

  protected boolExe(obs$: Observable<any>, errorLabel: string): Observable<boolean> {
    return obs$.pipe(
      switchMap(rs => {
        console.log(rs);

        const raw = {
          nonce: rs.nonce,
          gasPrice: rs.gasPrice,
          gasLimit: rs.gasLimit,
          to: rs.to,
          value: rs.value,
          data: rs.data,
          chainId: 11155111,
          type: rs,
          maxPriorityFeePerGas: rs.maxPriorityFeePerGas,
          maxFeePerGas: rs.maxFeePerGas,
        };

        const res = { ...rs, ...{ chainId: 11155111 } };

        const signSerializedTx = ethers.utils.serializeTransaction(res, { r: rs.r, s: rs.s, v: rs.v });
        const serializedTx = ethers.utils.serializeTransaction(res);

        console.log('tx', serializedTx);
        console.log('signTx', signSerializedTx);
        const transactionHash = ethers.utils.keccak256(signSerializedTx);
        console.log('txHash', transactionHash);

        const publicKey = ethers.utils.recoverPublicKey(ethers.utils.arrayify(ethers.utils.keccak256(serializedTx)), {
          r: rs.r,
          s: rs.s,
          v: rs.v,
        });

        console.log('publicKey', publicKey as string);
        const addr = ethers.utils.computeAddress(publicKey);

        console.log('addr', addr);

        return from(rs.wait());
      }),
      map(res => {
        return true;
      }),
      catchError(err => {
        console.warn(errorLabel, err);
        return of(false);
      })
    );
  }

  protected txHashExe(obs$: Observable<any>, errorLabel: string): Observable<string> {
    return obs$.pipe(
      switchMap((rs: any) => {
        return from(rs.wait());
      }),
      map((res: any) => {
        return res.transactionHash;
      }),
      catchError(err => {
        console.warn(errorLabel, err);
        return of('');
      })
    );
  }

  private increaseGas(contractGasFun: Function, ...args: any[]): Observable<{ gasLimit: BigNumber }> {
    return from(contractGasFun(...args) as Promise<BigNumber>).pipe(
      map((gas: BigNumber) => {
        return { gasLimit: BigNumber.from(Math.ceil(gas.toNumber() * 1.5)) };
      })
    );
  }
}

export const contractCaller = new ContractCaller();
