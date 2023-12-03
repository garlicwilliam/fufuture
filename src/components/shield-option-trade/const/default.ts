import { SldDecimal, SldDecPercent } from '../../../util/decimal';

export const SLIPPAGE = {
  A: SldDecPercent.genPercent('0.5'),
  B: SldDecPercent.genPercent('1'),
  C: SldDecPercent.genPercent('3'),
};

export const DEFAULT_SLIPPAGE: SldDecPercent = SLIPPAGE.A;
export const DEFAULT_DEADLINE: SldDecimal = SldDecimal.fromNumeric('20', 0);
