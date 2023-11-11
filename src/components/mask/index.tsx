import styles from './style.module.less';
import success from '../../assets/imgs/mask/success.svg';
import pending from '../../assets/imgs/mask/pending.svg';
import fail from '../../assets/imgs/mask/failed.svg';
import ReactDOM from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';
import { SldButton } from '../common/buttons/sld-button';
import { Visible } from '../builtin/hidden';
import { I18n } from '../i18n/i18n';
import { P } from '../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../util/string';
import { fontCss } from '../i18n/font-switch';
import { i18n } from '../i18n/i18n-fn';

export default {
  dom: null,

  $run(
    url: string,
    pendingText: string | null = i18n('com-pending'),
    failText: string | null = i18n('com-failed'),
    title: string | null = null
  ) {
    if (failText === null) {
      failText = i18n('com-failed');
    }

    if (pendingText === null) {
      pendingText = i18n('com-pending');
    }

    const isMobile = P.Layout.IsMobile.get();
    const styleMr = bindStyleMerger(isMobile ? styles.mobile : '');

    // @ts-ignore
    this.hide();
    // @ts-ignore
    this.dom = document.createElement('div');

    const JSXdom = (
      <div className={styleMr(styles.tooltip)}>
        <div className={styleMr(styles.wpr)}>
          <div className={styleMr(styles.content)}>
            <span
              onClick={() => {
                this.hide();
              }}
              className={styleMr(styles.close)}
            >
              <CloseOutlined />
            </span>

            {title ? <div className={styleMr(styles.title)}>{title}</div> : null}

            <div className={styleMr(styles.imgContent)}>
              <img src={url} alt="" className={url === pending ? styles.loading : ''} />
            </div>

            <p className={styleMr(styles.descText, fontCss.medium)}>
              {url === fail ? failText : url === success ? <I18n id={'com-succeed'} /> : pendingText}
            </p>

            <Visible when={url !== pending}>
              <SldButton
                size={isMobile ? 'small' : 'large'}
                type={'none'}
                onClick={() => this.hide()}
                className={'shield-btn'}
              >
                <I18n id={'com-ok'} />
              </SldButton>
            </Visible>
          </div>
        </div>
      </div>
    );
    // @ts-ignore
    ReactDOM.render(JSXdom, this.dom);
    // @ts-ignore
    document.body.appendChild(this.dom);
  },

  showLoading(loadingText: string | null = null, title: string | null = null) {
    this.$run(pending, loadingText, null, title);
  },

  showSuccess(title: string | null = null) {
    this.$run(success, null, null, title);
  },

  showFail(failText: string | null = null, title: string | null = null) {
    this.$run(fail, null, failText, title);
  },

  hide() {
    // @ts-ignore
    this.dom && this.dom.remove();
  },
};
