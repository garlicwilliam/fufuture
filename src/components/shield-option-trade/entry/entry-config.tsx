import './entry-var';
import { addAppListener } from '../../../util/app';
import { updateMobileMode, P } from '../../../state-manager/page/page-state-parser';

addAppListener('resize', updateMobileMode);

P.Option.Trade.Select.Extend.watch().subscribe((isExtend: boolean) => {
  const val = isExtend ? 'overflow: hidden' : '';
  document.body.setAttribute('style', val);
});
