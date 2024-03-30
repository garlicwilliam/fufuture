import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../util/string';
import { AppendBody } from './append-body';
import styles from './result-mask.module.less';
import { CloseOutlined } from '@ant-design/icons';
import { fontCss } from '../../i18n/font-switch';
import pending from '../../../assets/imgs/mask/pending.svg';
import fail from '../../../assets/imgs/mask/failed.svg';
import success from '../../../assets/imgs/mask/success.svg';
import { I18n } from '../../i18n/i18n';
import { Visible } from '../../builtin/hidden';
import { SldButton } from '../buttons/sld-button';
import { ReactNode } from 'react';
import { MaskEvent, maskService } from '../../../services/mask/mask.service';
import { tap } from 'rxjs/operators';

type IState = {
  isMobile: boolean;
  show: boolean;
  title: ReactNode | null;
  text: ReactNode | null;
  status: 'pending' | 'success' | 'failed' | null;
};
type IProps = {};

export class ResultMask extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    show: false,
    title: null,
    text: null,
    status: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.sub(
      maskService.watchEvent().pipe(
        tap((event: MaskEvent) => {
          switch (event.type) {
            case 'failed': {
              this.failed(event.text, event.title);
              break;
            }
            case 'success': {
              this.success(event.text, event.title);
              break;
            }
            case 'pending': {
              this.pending(event.text, event.title);
              break;
            }
            case 'hide': {
              this.hide();
              break;
            }
          }
        })
      )
    );
  }

  componentWillUnmount() {
    this.destroyState();
  }

  pending(pendingText: ReactNode, title?: ReactNode) {
    this.updateState({ show: true, status: 'pending', text: pendingText, title: title });
  }

  success(successText: ReactNode, title?: ReactNode) {
    this.updateState({ show: true, status: 'success', text: successText, title: title });
  }

  failed(failText: ReactNode, title?: ReactNode) {
    this.updateState({ show: true, status: 'failed', text: failText, title: title });
  }

  hide() {
    this.updateState({ status: null, text: null, title: null, show: false });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const imgSrc =
      this.state.status === 'pending'
        ? pending
        : this.state.status === 'success'
        ? success
        : this.state.status === 'failed'
        ? fail
        : pending;

    return (
      <AppendBody>
        <div className={styleMr(styles.bgMask)} style={{ display: this.state.show ? 'block' : 'none' }}>
          <div className={styleMr(styles.content, 'sld-mask-content')}>
            <div onClick={() => maskService.hide()} className={styleMr(styles.close)}>
              <CloseOutlined />
            </div>

            {this.state.title ? <div className={styleMr(styles.title)}>{this.state.title}</div> : null}

            <div className={styleMr(styles.imgContent)}>
              <img src={imgSrc} alt="" className={this.state.status === 'pending' ? styles.loading : ''} />
            </div>

            <p className={styleMr(styles.descText, fontCss.medium)}>{this.state.text}</p>

            <Visible when={this.state.status !== 'pending'}>
              <SldButton
                size={this.state.isMobile ? 'small' : 'large'}
                type={'none'}
                onClick={() => maskService.hide()}
                className={'shield-btn'}
              >
                <I18n id={'com-ok'} />
              </SldButton>
            </Visible>
          </div>
        </div>
      </AppendBody>
    );
  }
}

export const MASK = <ResultMask />;
