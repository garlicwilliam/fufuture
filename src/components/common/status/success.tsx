import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../util/string';
import success from '../../../assets/imgs/mask/success.svg';
import styles from './status.module.less';

type IState = {
  isMobile: boolean;
};
type IProps = {
  sizeClassName?: string;
};

export class StatusSuccess extends BaseStateComponent<IProps, IState> {
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
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);
    const sizeClass: string = this.props.sizeClassName ? this.props.sizeClassName : styles.normalSize;

    return (
      <div className={styleMr(styles.imgContent, sizeClass)}>
        <img src={success} alt={''} />
      </div>
    );
  }
}
