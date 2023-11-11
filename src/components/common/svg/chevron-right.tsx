import { SvgProps } from './svg-props';
import { px } from './util-function';

export function ChevronRight(props: SvgProps) {
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
          transform="translate(7.931047, 6.999987) scale(-1, 1) translate(-7.931047, -6.999987) "
          points="3.49042497 7 9.83416701 13.343742 12.3716681 10.806241 8.56541435 6.99998726 12.3716681 3.19373354 9.83416701 0.656232477 3.49042497 6.99997451"
        />
      </g>
    </svg>
  );
}
