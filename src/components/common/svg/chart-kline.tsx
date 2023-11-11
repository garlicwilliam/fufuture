import { SvgProps } from './svg-props';
import { px } from './util-function';

export function ChartKline(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={props.fill ? props.fill : 'currentColor'}
      width={px(props.width)}
      height={px(props.height)}
      viewBox="0 0 16 16"
    >
      <g id="page-1" stroke="currentColor" strokeWidth="1.6" fill="none" fillRule="evenodd">
        <g id="group-29-2">
          <rect id="rect" x="0.8" y="0.8" width="14.4" height="14.4" rx="3.2" />
        </g>
        <g id="group-33" transform="translate(4.400000, 4.800000)" strokeLinecap="round">
          <line x1="0.4" y1="3.83759045" x2="0.4" y2="6.37206791" id="path-4" />
          <line x1="3.6" y1="0.0772953625" x2="3.6" y2="6.37206791" id="path-4-bak" />
          <line x1="6.8" y1="0" x2="6.8" y2="3.97206791" id="path-4bak-2" />
        </g>
      </g>
    </svg>
  );
}
