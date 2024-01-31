import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../util/string';
import styles from './token-check-box.module.less';
import { Checkbox } from 'antd';
import { TokenErc20 } from '../../../../state-manager/state-types';
import { TokenLabel } from './token-label';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

type IState = {
  isMobile: boolean;
};
type IProps = {
  token: TokenErc20;
  checked?: (checked: boolean) => void;
  curChecked: boolean;
};

export class TokenCheckBox extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onChange(event: CheckboxChangeEvent) {
    if (this.props.checked) {
      this.props.checked(event.target.checked);
    }
  }

  render() {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.checkWrapper)}>
        <Checkbox checked={this.props.curChecked} onChange={this.onChange.bind(this)} />
        <span>{this.props.token.symbol}</span>
      </div>
    );
  }
}
