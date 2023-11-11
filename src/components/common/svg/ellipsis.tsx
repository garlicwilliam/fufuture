import { SvgProps } from './svg-props';
import { clr, px } from './util-function';

export function EllipsisIcon(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      fill={clr(props.fill)}
      viewBox="0 0 36 36"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="31.1" cy="18" r="2.9" />
      <circle cx="18" cy="18" r="2.9" />
      <circle cx="4.9" cy="18" r="2.9" />
    </svg>
  );
}
