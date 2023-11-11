import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../util/string';
import styles from './not-found.module.less';
import { fontCss } from '../../i18n/font-switch';
import { SldButton } from '../../common/buttons/sld-button';
import { FixPadding } from '../../common/content/fix-padding';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class TradeNotFound extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  goHome() {
    const url = window.location.protocol + '//' + window.location.host;

    window.location.href = url;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <FixPadding top={100} bottom={0} mobTop={80} mobBottom={0}>
        <div className={styleMr(styles.wrapperError)}>
          <div className={styleMr(styles.wrapperMain, fontCss.bold)}>404</div>
          <div className={styleMr(styles.wrapperText)}>Oops, page not found.</div>
          <div className={styleMr(styles.wrapperAction)}>
            <SldButton size={'large'} type={'primary'} className={styleMr(styles.btn)} onClick={this.goHome.bind(this)}>
              Back Home
            </SldButton>
          </div>
        </div>
      </FixPadding>
    );
  }
}
