import { SvgProps } from './svg-props';
import { px } from './util-function';

export function ChevronLeft(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      viewBox="0 0 14 14"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="KOL" stroke="none" strokeWidth="1" fillRule="evenodd" fill={props.fill ? props.fill : 'currentColor'}>
        <polygon
          id="path"
          points="2.5 6.84376752 8.84374203 13.1875096 11.3812431 10.6500085 7.57498938 6.84375478 11.3812431 3.03750106 8.84374203 0.5 2.5 6.84374203"
        />
      </g>
    </svg>
  );
}
