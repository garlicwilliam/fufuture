import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../util/string';
import { AppendBody } from './append-body';
import styles from './modal-box.module.less';
import { Visible } from '../../builtin/hidden';
import { addBodyClass, delBodyClass, delBodyProperty, getBodyProperty, setBodyProperty } from '../../../util/app';

type IState = {
  isMobile: boolean;
  visible: boolean;
};
type IProps = {
  className?: string;
  visible?: boolean;
  maskClickClose?: boolean;
  onClose?: () => void;
};

export class SldModalBox extends BaseStateComponent<IProps, IState> {
  static readonly bodyProperty: string = '_sld_modal_box_ids_';

  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: false,
  };

  private id: string = Math.ceil(Math.random() * 10000000000).toString();

  componentDidMount(): void {
    this.registerIsMobile('isMobile');
    this.updateVisibleState();
  }

  componentWillUnmount(): void {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
    if (prevProps.visible !== this.props.visible) {
      this.updateVisibleState();
    }
  }

  private updateVisibleState(): void {
    const newStatus: boolean = !!this.props.visible;
    this.updateState({ visible: newStatus });

    // if (newStatus) {
    //   this.addBodyId();
    //   this.addBodyClassScroll();
    // } else {
    //   const count: number = this.delBodyId();
    //   if (count === 0) {
    //     this.delBodyClassScroll();
    //   }
    // }
  }

  private addBodyClassScroll(): void {
    addBodyClass('sld_modal_box');
  }

  private delBodyClassScroll(): void {
    delBodyClass('sld_modal_box');
  }

  private addBodyId(): number {
    const val: string | null = getBodyProperty(SldModalBox.bodyProperty);
    const vals: string[] = val ? val.split(';').filter(Boolean) : [];

    vals.push(this.id);

    const newCount = vals.length;
    const newVal: string = vals.join(';');
    setBodyProperty(SldModalBox.bodyProperty, newVal);

    return newCount;
  }

  private delBodyId(): number {
    const val: string | null = getBodyProperty(SldModalBox.bodyProperty);
    const vals: string[] = val ? val.split(';').filter(Boolean) : [];

    const sets: Set<string> = new Set(vals);

    sets.delete(this.id);

    const newCount = sets.size;

    const newVal: string = Array.from(sets).join(';');

    if (newVal === '') {
      delBodyProperty(SldModalBox.bodyProperty);
    } else {
      setBodyProperty(SldModalBox.bodyProperty, newVal);
    }

    return newCount;
  }

  onMaskClose() {
    if (this.props.maskClickClose && this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return (
      <AppendBody>
        <Visible when={this.state.visible}>
          <div className={styleMr(styles.mask)} onClick={this.onMaskClose.bind(this)} />
          <div className={styleMr(styles.boxWrapper, this.props.className)}>{this.props.children}</div>
        </Visible>
      </AppendBody>
    );
  }
}
