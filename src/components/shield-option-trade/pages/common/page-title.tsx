import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './page-title.module.less';
import { ReactNode } from 'react';
import { fontCss } from '../../../i18n/font-switch';
import { Visible } from '../../../builtin/hidden';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RouteKey } from '../../../../constant/routes';

type IState = {
  isMobile: boolean;
};
type IProps = {
  title: ReactNode;
  backRoute?: RouteKey;
};

export class PageTitle extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  backTo() {
    if (this.props.backRoute) {
      this.navigateTo(this.props.backRoute);
    }
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperPageTitle)}>
        <Visible when={!!this.props.backRoute}>
          <div className={styleMr(styles.backRoute)} onClick={() => this.backTo()}>
            <div className={styleMr(styles.bg)}>
              <ArrowLeftOutlined />
            </div>
          </div>
        </Visible>

        <div className={styleMr(styles.mainTitle, fontCss.bold)}>{this.props.title}</div>
      </div>
    );
  }
}
