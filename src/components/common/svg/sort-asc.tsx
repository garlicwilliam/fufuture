import { SvgProps } from './svg-props';
import { px } from './util-function';

export function SortAsc(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      version="1.1"
      viewBox="0 0 500 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill={props.fill ? props.fill : 'currentColor'}
        transform="matrix(-0.00159301,-1,-1.0024658,0.00158909,800,998.94596)"
      >
        <path d="M 616.7,336.7 V 570 H 10 v 93.3 h 980 z" id="path11-5" />
      </g>
    </svg>
  );
}
