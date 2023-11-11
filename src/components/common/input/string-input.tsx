import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../util/string';
import styles from './string-input.module.less';
import { BaseSyntheticEvent, ReactNode } from 'react';
import { Visible } from '../../builtin/hidden';
import { asyncScheduler } from 'rxjs';

type IState = {
  isMobile: boolean;
  isActive: boolean;
};

type IProps = {
  name?: string;
  className?: string;
  inputClassName?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  replace?: ReactNode;
  value?: string;
  placeholder?: string;
  isError?: boolean;
  theme?: number;
  onChange?: (val: string) => void;
};

export class StringInput extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isActive: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onFocus(isFocus: boolean) {
    this.updateState({ isActive: isFocus });
  }

  onChangeValue(event: BaseSyntheticEvent) {
    asyncScheduler.schedule(() => {
      if (this.props.onChange) {
        this.props.onChange(event.target.value);
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const themeCss = this.props.theme === 1 ? styles.theme1 : this.props.theme === 2 ? styles.theme2 : '';

    return (
      <div className={styleMr(this.props.className, themeCss)}>
        <div
          className={styleMr(
            styles.wrapperInput,
            'sld_str_input',
            cssPick(this.state.isActive, 'sld_str_input_active'),
            cssPick(this.props.isError, 'sld_str_input_error')
          )}
        >
          <Visible when={!!this.props.prefix}>
            <div className={styleMr('sld_str_input_prefix')}>{this.props.prefix}</div>
          </Visible>

          {this.props.replace ? (
            <div className={styleMr('sld_str_input_replace')}>{this.props.replace}</div>
          ) : (
            <input
              type={'text'}
              className={styleMr('sld_str_input_form', this.props.inputClassName)}
              //value={this.props.value}
              placeholder={this.props.placeholder}
              onBlur={() => this.onFocus(false)}
              onFocus={() => this.onFocus(true)}
              onChange={this.onChangeValue.bind(this)}
              name={this.props.name}
            />
          )}

          <Visible when={!!this.props.suffix}>
            <div className={styleMr('sld_str_input_suffix')}>{this.props.suffix}</div>
          </Visible>
        </div>
      </div>
    );
  }
}
