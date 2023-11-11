import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { Location, NavigateFunction, useLocation, useNavigate, useParams, Params } from 'react-router-dom';

export type LocationProps = { location: Location; param: Params; nav: NavigateFunction };
export type EmptyProps = { _?: boolean };

export const prefixPath = '/u';

export function withLocation<T extends {}, S>(
  ComponentImp: typeof BaseStateComponent<T & LocationProps, S>
): (props: T) => JSX.Element {
  return function WithLocationComponent(props: T) {
    let location: Location = useLocation();
    location = Object.assign({}, location, {
      pathname: location.pathname.startsWith(prefixPath)
        ? location.pathname.substring(prefixPath.length)
        : location.pathname,
    });

    const param: Params = useParams();
    const nav = useNavigate();

    const locProps: LocationProps = { location, param, nav };

    return <ComponentImp {...props} {...locProps} />;
  };
}
