import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { IdenticonOptions } from 'identicon.js';
import Identicon from 'identicon.js';
import _ from 'lodash';
import CryptoJS from 'crypto-js';

type IProps = {
  hash: string;
  size: number;
};
type IState = {
  isMobile: boolean;
};

export class HashAvatar extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const realHash = this.props.hash.length < 15 ? _.padEnd(this.props.hash, 15, '0') : this.props.hash;
    const hash = CryptoJS.MD5(realHash).toString();
    const options: IdenticonOptions = { size: this.props.size, format: 'svg', margin: 0 };
    const data = new Identicon(hash, options);

    return (
      <img
        width={this.props.size + 'px'}
        height={this.props.size + 'px'}
        src={'data:image/svg+xml;base64,' + data}
        alt={''}
      />
    );
  }
}
