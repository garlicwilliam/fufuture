import { SvgProps } from './svg-props';
import { px } from './util-function';

export function VerticalLineIcon(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      fill={props.fill ? props.fill : 'currentColor'}
      viewBox="0 0 16 16"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 0h1v16h-1v-16z" />
    </svg>
  );
}
