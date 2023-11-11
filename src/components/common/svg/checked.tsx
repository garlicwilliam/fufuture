import { SvgProps } from './svg-props';
import { px } from './util-function';

export function Checked(props: SvgProps) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1280.000000 1034.000000"
      width={px(props.width)}
      height={px(props.height)}
      fill={props.fill ? props.fill : 'currentColor'}
    >
      <g transform="translate(0.000000,1034.000000) scale(0.100000,-0.100000)" stroke="none">
        <path
          d="M7625 7270 l-3070 -3070 -1232 1232 -1233 1233 -1045 -1045 c-691
-691 -1045 -1052 -1045 -1065 0 -29 4527 -4555 4557 -4555 15 0 1188 1169
4130 4115 2259 2263 4110 4122 4112 4131 4 20 -2065 2094 -2089 2094 -8 0
-1397 -1381 -3085 -3070z"
        />
      </g>
    </svg>
  );
}