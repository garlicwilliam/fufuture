import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import ReactDOM from 'react-dom';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { appendBodyService } from '../../../services/append-body/append-body.service';

type IProps = {};
type IState = {
  isMobile: boolean;
};

export class AppendBody extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  private appendElement: HTMLDivElement | null = null;
  private id: string | null = null;

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this._render();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    this._render();
  }

  componentWillUnmount() {
    this._destroyElement();
    this.destroyState();
  }

  _createId(): string {
    return 'append-body-' + Math.ceil(Math.random() * 10000000000).toString();
  }

  _createElement() {
    this.appendElement = document.createElement('div');
    this.appendElement.id = this._createId();

    document.body.appendChild(this.appendElement);
  }

  _render() {
    return this._render2();
  }

  _destroyElement() {
    return this._destroyElement2();
  }

  _destroyElement1() {
    if (this.appendElement) {
      if (this.appendElement.parentNode) {
        ReactDOM.unmountComponentAtNode(this.appendElement);
        this.appendElement.parentNode.removeChild(this.appendElement);
      }
    }
  }

  _render1() {
    if (this.appendElement === null) {
      this._createElement();
    }

    if (this.props.children) {
      const jsx = <BrowserRouter>{this.props.children}</BrowserRouter>;

      ReactDOM.render(jsx, this.appendElement);
    }
  }

  _destroyElement2() {
    if (this.id) {
      appendBodyService.removeElement(this.id);
    }
  }

  _render2() {
    if (!this.id) {
      this.id = this._createId();
    }

    const el = <>{this.props.children}</>;

    appendBodyService.renderElement(el, this.id);
  }

  render() {
    return null;
  }
}
