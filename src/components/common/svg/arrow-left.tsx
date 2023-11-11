import { SvgProps } from './svg-props';
import { px } from './util-function';

export function ArrowLeft(props: SvgProps) {
  return (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      viewBox="0 0 30 30"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="kol"
        stroke="none"
        strokeWidth="1"
        fillRule="evenodd"
        fill={props.fill ? props.fill : 'currentColor'}
        transform="translate(-1, -1)"
      >
        <path
          d="M10.7437165,16 L17.0874586,22.343742 L19.6249596,19.806241 L15.8187059,15.9999873 L19.6249596,12.1937335 L17.0874586,9.65623248 L10.7437165,15.9999745 L10.7437165,16 Z M30.5,16 C30.5,8.02500637 23.9749936,1.5 16,1.5 C8.02500637,1.5 1.5,8.02500637 1.5,16 C1.5,23.9749936 8.02500637,30.5 16,30.5 C23.9749936,30.5 30.5,23.9749936 30.5,16 Z M26.8749979,16 C26.8749979,21.9812558 21.9812431,26.8750106 15.9999873,26.8750106 C10.0187314,26.8750106 5.12497664,21.9812558 5.12497664,16 C5.12497664,10.0187442 10.0187314,5.12498938 15.9999873,5.12498938 C21.9812431,5.12498938 26.8749979,10.0187442 26.8749979,16 Z"
          id="shape"
        />
      </g>
    </svg>
  );
}
