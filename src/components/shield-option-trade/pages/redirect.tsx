import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { EmptyProps, LocationProps, withLocation } from '../../common/utils/location-wrapper';
import { parseQueryString, parseReferralCode } from '../../../util/string';
import { RouteKey } from '../../../constant/routes';
import { C } from '../../../state-manager/cache/cache-state-parser';

type IState = {
  isMobile: boolean;
};
type IProps = {} & EmptyProps & LocationProps;

class RefRedirectImg extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    const search: string = this.props.location.search;

    if (!search || search.length === 0) {
      this.navigateTo(RouteKey.trade);
      return;
    }

    const qParam = parseQueryString(search);
    let refCode = qParam['r'];

    refCode = parseReferralCode(refCode);

    if (refCode) {
      C.Option.Broker.Address.set(refCode);
    }

    window.location.href = window.location.origin;
    return;
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    // this.navigateTo(RouteKey.trade);
    return <></>;
  }
}

export const RefRedirect = withLocation(RefRedirectImg);
