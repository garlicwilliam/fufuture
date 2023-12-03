import { P } from '../page/page-state-parser';
import { switchMap } from 'rxjs/operators';
import { shieldOptionTradeContracts } from '../../components/shield-option-trade/contract/shield-option-trade-contract';

import {ShieldUnderlyingType} from "../state-types";

export const MappedState = {
  OPTION_CUR_ORACLE: P.Option.Trade.Pair.Base.watch().pipe(
    switchMap(base =>
      base === ShieldUnderlyingType.ETH
        ? shieldOptionTradeContracts.CONTRACTS.ethOracle
        : shieldOptionTradeContracts.CONTRACTS.btcOracle
    )
  ),
};
