import { SvgProps } from './svg-props';
import { px } from './util-function';

export function CheckboxUnchecked(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={px(props.width)}
      height={px(props.height)}
      fill={props.fill ? props.fill : 'currentColor'}
      viewBox="0 0 24 24"
    >
      <path d="M22 2v20h-20v-20h20zm2-2h-24v24h24v-24z" />
    </svg>
  );
}
