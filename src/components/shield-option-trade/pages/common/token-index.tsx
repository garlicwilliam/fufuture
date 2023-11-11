import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './token-index.module.less';

type IState = {
  isMobile: boolean;
};
type IProps = {
  token: symbol | string;
};

export class TokenIndex extends BaseStateComponent<IProps, IState> {
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

    const sym = typeof this.props.token === 'symbol' ? this.props.token.description : this.props.token;

    return (
      <span>
        {sym}
        <span className={styleMr(styles.index)}>USD</span>
      </span>
    );
  }
}
