import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './token-icon.module.less';
import { TokenErc20 } from '../../../../state-manager/state-types';
import * as _ from 'lodash';
import { tokenCacheService } from '../../services/token-cache.service';
import { TokenDefaultIcon } from './token-default-icon';
import { tap } from 'rxjs/operators';

type IState = {
  isMobile: boolean;
  iconUrl: string | null | undefined;
};
type IProps = {
  size: number;
  token: TokenErc20;
  className?: string;
};

function px(num: number): string {
  return num + 'px';
}

export class TokenIcon extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    iconUrl: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.loadIcon();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (_.isEqual(this.props.token, prevProps.token)) {
      this.loadIcon();
    }
  }

  private loadIcon() {
    const icon$ = tokenCacheService.getTokenIcon(this.props.token).pipe(
      tap((icon: string | null) => {
        this.updateState({ iconUrl: icon });
      })
    );

    this.subOnce(icon$);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <>
        {this.state.iconUrl ? (
          <div
            className={styleMr(styles.icon, this.props.className)}
            style={{ minWidth: px(this.props.size), width: px(this.props.size), height: px(this.props.size) }}
          >
            <img src={this.state.iconUrl} alt={''} width={this.props.size} height={this.props.size} />
          </div>
        ) : (
          <TokenDefaultIcon token={this.props.token} size={this.props.size} classname={this.props.className} />
        )}
      </>
    );
  }
}
