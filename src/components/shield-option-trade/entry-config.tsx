import { addAppListener, AppName, setAppName } from '../../util/app';
import { updateMobileMode, P } from '../../state-manager/page/page-state-parser';

setAppName(AppName.ShieldTrade);
addAppListener('resize', updateMobileMode);
P.Option.Trade.Select.Extend.watch().subscribe((isExtend: boolean) => {
  const val = isExtend ? 'overflow: hidden' : '';
  document.body.setAttribute('style', val);
});
