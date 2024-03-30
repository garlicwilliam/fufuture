import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from './metamask-like-types';
import { BehaviorSubject } from 'rxjs';

export const EIP6963_PROVIDERS = new BehaviorSubject<EIP6963ProviderDetail[]>([]);

// @ts-ignore
window.addEventListener<'eip6963:announceProvider'>(
  'eip6963:announceProvider',
  (event: EIP6963AnnounceProviderEvent) => {
    if (event.type === 'eip6963:announceProvider') {
      const currentInjected: EIP6963ProviderDetail[] = EIP6963_PROVIDERS.getValue();
      const exist: boolean = currentInjected.some(one => one.info.uuid === event.detail.info.uuid);
      if (!exist) {
        currentInjected.push(event.detail);
        EIP6963_PROVIDERS.next(currentInjected);
      }
    }
  }
);

window.dispatchEvent(new Event('eip6963:requestProvider'));
