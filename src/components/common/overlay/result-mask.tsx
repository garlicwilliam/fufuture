import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../util/string';
import { AppendBody } from './append-body';
import styles from './result-mask.module.less';
import { CloseOutlined } from '@ant-design/icons';
import { fontCss } from '../../i18n/font-switch';
import { I18n } from '../../i18n/i18n';
import { Visible } from '../../builtin/hidden';
import { SldButton } from '../buttons/sld-button';
import { ReactNode } from 'react';
import { MaskEvent, maskService } from '../../../services/mask/mask.service';
import { tap } from 'rxjs/operators';
import { StatusPending } from '../status/pending';
import { StatusSuccess } from '../status/success';
import { StatusFailed } from '../status/failed';

type IState = {
  isMobile: boolean;
  show: boolean;
  title: ReactNode | null;
  text: ReactNode | null;
  status: 'pending' | 'success' | 'failed' | null;
  useBtn: boolean;
};
type IProps = {};

export class ResultMask extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    show: false,
    title: null,
    text: null,
    status: null,
    useBtn: true,
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
              this.success(event.text, event.title, event.useBtn);
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
    this.updateState({ show: true, status: 'pending', text: pendingText, title: title, useBtn: true });
  }

  success(successText: ReactNode, title?: ReactNode, useBtn?: boolean) {
    this.updateState({
      show: true,
      status: 'success',
      text: successText,
      title: title,
      useBtn: useBtn !== false,
    });
  }

  failed(failText: ReactNode, title?: ReactNode) {
    this.updateState({ show: true, status: 'failed', text: failText, title: title, useBtn: true });
  }

  hide() {
    this.updateState({ status: null, text: null, title: null, show: false, useBtn: true });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const status =
      this.state.status === 'pending' ? (
        <StatusPending />
      ) : this.state.status === 'success' ? (
        <StatusSuccess />
      ) : this.state.status === 'failed' ? (
        <StatusFailed />
      ) : (
        <StatusPending />
      );

    return (
      <AppendBody>
        <div className={styleMr(styles.bgMask)} style={{ display: this.state.show ? 'block' : 'none' }}>
          <div className={styleMr(styles.content, 'sld-mask-content')}>
            <div onClick={() => maskService.hide()} className={styleMr(styles.close)}>
              <CloseOutlined />
            </div>

            {this.state.title ? <div className={styleMr(styles.title)}>{this.state.title}</div> : null}

            {status}

            <p className={styleMr(styles.descText, fontCss.medium)}>{this.state.text}</p>

            <Visible when={this.state.status !== 'pending' && this.state.useBtn}>
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
