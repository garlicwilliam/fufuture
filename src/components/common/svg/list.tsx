import { SvgProps } from './svg-props';
import { px } from './util-function';

export function ListIcon(props: SvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 19"
      xmlns="http://www.w3.org/2000/svg"
      width={px(props.width)}
      height={px(props.height)}
    >
      <g stroke={props.fill ? props.fill : 'currentColor'} strokeWidth="2" transform="translate(-4 -3)">
        <rect height="17" rx="2" width="14" x="5" y="4" />
        <g strokeLinecap="round">
          <path d="m9 9h6" />
          <path d="m9 13h6" />
          <path d="m9 17h4" />
        </g>
      </g>
    </svg>
  );
}
