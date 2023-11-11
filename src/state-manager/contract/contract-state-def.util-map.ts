import { P } from '../page/page-state-parser';
import { switchMap } from 'rxjs/operators';
import { shieldOptionTradeContracts } from '../const/shield-option-trade-contract';
import { IndexUnderlyingType } from '../../components/shield-option-trade/const/assets';

export const MappedState = {
  OPTION_CUR_ORACLE: P.Option.Trade.Pair.Base.watch().pipe(
    switchMap(base =>
      base === IndexUnderlyingType.ETH
        ? shieldOptionTradeContracts.CONTRACTS.ethOracle
        : shieldOptionTradeContracts.CONTRACTS.btcOracle
    )
  ),
};
