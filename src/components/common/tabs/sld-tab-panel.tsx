import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { ReactNode } from 'react';
import { cssPick, styleMerge } from '../../../util/string';

type IState = {};
type IProps = {
  tid: string;
  tab: string | ReactNode;
  className?: string;
  disabled?: boolean;
};

export class SldTabPanel extends BaseStateComponent<IProps, IState> {
  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    return (
      <div
        className={styleMerge(
          'sldTabPanel',
          cssPick(this.props.disabled, 'sld_tab_panel_disabled'),
          this.props.className
        )}
      >
        {this.props.children}
      </div>
    );
  }
}
