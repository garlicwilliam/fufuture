import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './token-default-icon.module.less';
import { TokenErc20 } from '../../../../state-manager/state-types';
import { fontCss } from '../../../i18n/font-switch';

type IState = {
  isMobile: boolean;
};
type IProps = {
  token: TokenErc20;
  size?: number;
  classname?: string;
};

export class TokenDefaultIcon extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const i = this.props.token.symbol.substring(0, 1);
    const size: string | undefined = this.props.size ? this.props.size + 'px' : undefined;
    const fontSize = this.props.size ? this.props.size / 1.7 + 'px' : undefined;
    const borderWidth: string = this.props.size && this.props.size > 16 ? '2px' : '1px';

    return (
      <div
        className={styleMr(styles.tokenFontIcon, fontCss.boldLatin, this.props.classname)}
        style={{ width: size, height: size, fontSize: fontSize, borderWidth }}
      >
        {i}
      </div>
    );
  }
}
