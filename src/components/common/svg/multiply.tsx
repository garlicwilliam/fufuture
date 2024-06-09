import { SvgProps } from './svg-props';
import { px } from './util-function';

export function MultiplyIcon(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      fill={props.fill ? props.fill : 'currentColor'}
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        transform="translate(0, -3.5)"
        d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"
      />
    </svg>
  );
}
