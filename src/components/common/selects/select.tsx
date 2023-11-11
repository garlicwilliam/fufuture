import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, styleMerge } from '../../../util/string';
import styles from './select.module.less';
import { IconDropdown } from '../icon/dropdown';
import { SldOverlay, TriggerEvent } from '../overlay/overlay';
import { ReactNode } from 'react';
import { Resize } from '../utils/resize';
import { Placement } from '@floating-ui/core/src/types';
import { Visible } from '../../builtin/hidden';

export type SldSelectOption = {
  value: symbol | string | number;
  label: ReactNode;
  labelActive?: ReactNode;
  object?: any;
};

type IState = {
  isMobile: boolean;
  width: number | undefined;
  selected?: SldSelectOption;
  isDropdown: boolean;
  forceClose?: TriggerEvent;
};

type IProps = {
  options: SldSelectOption[];
  dropdownItemClassName?: string;
  dropdownItemActiveClassName?: string;
  dropdownClassName?: string;
  className?: string;
  parentClassName?: string;
  banDefaultStyle?: boolean;
  curSelected?: string | number | symbol;
  initSelected?: string | number | symbol;
  isDark?: boolean;
  isFlex?: boolean;
  noBorder?: boolean;
  onChangeSelect?: (op: SldSelectOption) => void;
  isDisabled?: boolean;
  emptyReplace?: ReactNode;
  noMatchReplace?: ReactNode;
  placement?: Placement;
  offset?: number;
  title?: ReactNode;
  dropdownSize?: number;
  zIndex?: number;
  trigger?: 'click' | 'hover';
};

export class SldSelect extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    width: undefined,
    isDropdown: false,
    forceClose: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.defaultSelect();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (this.props.options !== prevProps.options) {
      this.updateSelected();
    }

    this.defaultSelect();
  }

  defaultSelect() {
    if (this.state.selected === undefined && this.props.initSelected !== undefined) {
      const init = this.props.options.find(op => op.value === this.props.initSelected);

      this.updateState({ selected: init });
    }
  }

  updateSelected() {
    if (this.state.selected) {
      const curValue = this.state.selected.value;
      const newSelected = this.props.options.find(one => one.value === curValue);
      this.updateState({ selected: newSelected });
    }
  }

  static getDerivedStateFromProps(nextProps: IProps, preState: IState): null | Partial<IState> {
    if (nextProps.curSelected !== undefined) {
      const find: SldSelectOption | undefined = nextProps.options.find(op => op.value === nextProps.curSelected);
      if (!!find && find.value !== preState.selected?.value) {
        return { selected: find };
      } else if (!find) {
        return { selected: undefined };
      }
    }

    return null;
  }

  onDropdown(isDropdown: boolean) {
    this.updateState({ isDropdown: isDropdown });
  }

  onSelect(option: SldSelectOption) {
    if (this.props.onChangeSelect) {
      this.props.onChangeSelect(option);
    }

    if (!this.props.curSelected) {
      this.updateState({ selected: option });
    }

    this.updateState({ forceClose: { action: 'hide', date: new Date() } });
  }

  onResize(width: number) {
    this.updateState({ width });
  }

  private genOverlay(): ReactNode {
    return (
      <div
        className={styleMerge(styles.overlayInner, 'sld-select-dropdown-inner')}
        style={{ width: this.state.width && !this.props.isFlex ? this.state.width + 'px' : undefined }}
      >
        {this.props.options.map((option: SldSelectOption, index: number) => {
          const itemCss = this.props.dropdownItemClassName ? this.props.dropdownItemClassName : styles.item;
          const isActive = this.state.selected?.value === option.value;
          const activeCss = isActive
            ? this.props.dropdownItemActiveClassName
              ? this.props.dropdownItemActiveClassName
              : styles.active
            : '';

          const darkCss = cssPick(this.props.isDark, styles.dark);

          return (
            <div
              className={styleMerge(
                itemCss,
                activeCss,
                darkCss,
                'sld-select-dropdown-item',
                cssPick(isActive, 'sld-select-dropdown-item-active')
              )}
              key={index}
              onClick={() => this.onSelect(option)}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);
    const darkCss = cssPick(this.props.isDark, styles.dark);
    const flexCss = cssPick(this.props.isFlex, styles.flexWidth);
    const borderCss = cssPick(this.props.noBorder, styles.noBorder);
    const noOption: boolean = !this.props.options || this.props.options.length === 0;

    const dom = (
      <div
        className={styleMr(
          cssPick(!this.props.banDefaultStyle, styles.wrapperSelect),
          flexCss,
          darkCss,
          borderCss,
          cssPick(this.props.isDisabled, styles.disabled, 'sld-select-disabled'),
          cssPick(!!this.props.title, styles.withTitle),
          this.props.className,
          'sld-select-wrapper'
        )}
      >
        <Visible when={!!this.props.title}>
          <div className={styleMr(styles.title, 'sld-select-title')}>{this.props.title}</div>
        </Visible>

        <div className={styleMr(styles.selectedOption, darkCss, 'sld-selected-option')}>
          {noOption ? (
            <>{this.props.emptyReplace}</>
          ) : this.state.selected ? (
            this.state.selected?.labelActive || this.state.selected?.label
          ) : (
            <>{this.props.noMatchReplace}</> || <></>
          )}
        </div>

        <div
          className={styleMr(styles.icon, darkCss, cssPick(this.props.noBorder, styles.noBorder), 'sld-select-icon')}
        >
          <IconDropdown
            width={this.props.dropdownSize || 12}
            pointTo={this.state.isDropdown ? 'top' : 'down'}
            className={'sld-select-icon-svg'}
          />
        </div>
      </div>
    );

    return (
      <SldOverlay
        overlay={this.genOverlay()}
        placement={this.props.placement || 'bottom'}
        useArrow={false}
        overlayClassName={styleMr(styles.overlay, 'sld-select-dropdown', this.props.dropdownClassName)}
        contentClassName={styleMr('sld-select-dropdown-content')}
        visibleChange={this.onDropdown.bind(this)}
        forceTriggerEvent={this.state.forceClose}
        visible={this.props.isDisabled ? false : undefined}
        offset={this.props.offset}
        zIndex={this.props.zIndex}
        trigger={this.props.trigger || 'hover'}
      >
        <Resize onResize={this.onResize.bind(this)}>
          {this.props.parentClassName ? <div className={this.props.parentClassName}>{dom}</div> : dom}
        </Resize>
      </SldOverlay>
    );
  }
}
