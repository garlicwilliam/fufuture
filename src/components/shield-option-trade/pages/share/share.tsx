import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { TextBtn } from '../../../common/buttons/text-btn';
import { I18n } from '../../../i18n/i18n';
import { ShieldOrderInfo } from '../../../../state-manager/state-types';

type IState = {
  isMobile: boolean;
  isVisible: boolean;
};
type IProps = {
  className?: string;
  order: ShieldOrderInfo;
};

export class ShareOrder extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isVisible: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClick() {
    P.Option.Trade.ShareOrder.CurOrder.set(this.props.order);
    P.Option.Trade.ShareOrder.Visible.set(true);
  }

  render() {
    return (
      <>
        <TextBtn className={this.props.className} onClick={this.onClick.bind(this)}>
          <I18n id={'trade-share'} textUpper={'uppercase'} />
        </TextBtn>
      </>
    );
  }
}
