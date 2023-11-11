import { normalParser, normalSerializer } from './cache-state-serializer';
import { CacheStateDefine } from '../interface';
import { SldDecimal, SldDecPercent } from '../../util/decimal';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from '../../components/shield-option-trade/const/default';

export const CACHE_STATE = {
  Option: {
    Trade: {
      Setting: {
        Slippage: {
          _key: '_shield_option_slippage',
          _isGlobal: true,
          _serializer: (v: SldDecPercent) => {
            return v.percentFormat();
          },
          _parser: (c: string) => {
            try {
              return SldDecPercent.genPercent(c, 18);
            } catch (e) {
              return DEFAULT_SLIPPAGE;
            }
          },
        } as CacheStateDefine<SldDecPercent>,
        Deadline: {
          _key: '_shield_option_deadline',
          _isGlobal: true,
          _serializer: (v: SldDecimal) => v.format(),
          _parser: (c: string) => {
            try {
              return SldDecimal.fromNumeric(c, 0);
            } catch (e) {
              return DEFAULT_DEADLINE;
            }
          },
        } as CacheStateDefine<SldDecimal>,
      },
    },
    Broker: {
      Address: {
        _key: '_shield_broker_address_',
        _isGlobal: true,
        _serializer: normalSerializer,
        _parser: normalParser,
      } as CacheStateDefine<string>,
    },
  },
};
