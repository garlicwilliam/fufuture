import { SvgProps } from './svg-props';
import { px } from './util-function';

export function SvgUser(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      fill={props.fill ? props.fill : 'currentColor'}
      stroke={props.fill ? props.fill : 'currentColor'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
