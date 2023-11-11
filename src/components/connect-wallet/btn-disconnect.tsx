import { BaseStateComponent } from '../../state-manager/base-state-component';
import { P } from '../../state-manager/page/page-state-parser';
import { I18n } from '../i18n/i18n';
import { WalletButtonStyleType } from './common-types';
import { SldButton } from '../common/buttons/sld-button';
import { bindStyleMerger } from '../../util/string';
import styles from './btn-disconnect.module.less';
import { Visible } from '../builtin/hidden';
import { LoadingOutlined } from '@ant-design/icons';

type IProps = {
  onClick: () => void;
  styleType?: WalletButtonStyleType;
  pending?: boolean;
};

type IState = {
  isMobile: boolean;
};

export class DisconnectButton extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClick() {
    if (!this.props.pending) {
      this.props.onClick();
    }
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <SldButton
        size={'large'}
        type={'none'}
        className={styleMr('shield-btn')}
        onClick={this.onClick.bind(this)}
        disabled={this.props.pending}
      >
        <I18n id={'com-disconnect-wallet'} />

        <Visible when={!!this.props.pending}>
          &nbsp;
          <LoadingOutlined />
        </Visible>
      </SldButton>
    );
  }
}
