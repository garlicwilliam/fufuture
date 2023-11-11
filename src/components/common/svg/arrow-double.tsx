import { SvgProps } from './svg-props';
import { px } from './util-function';

export function ArrowDouble(props: SvgProps) {
  const icon: JSX.Element = (
    <svg
      width={px(props.width)}
      height={px(props.height)}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 32 40"
      fill={props.fill ? props.fill : 'currentColor'}
    >
      <path d="M16,17.5a1.51,1.51,0,0,1-1.06-.44l-12-12A1.5,1.5,0,0,1,5.06,2.94L16,13.88,26.94,2.94a1.5,1.5,0,0,1,2.12,2.12l-12,12A1.51,1.51,0,0,1,16,17.5Zm1.06,11.56,12-12a1.5,1.5,0,0,0-2.12-2.12L16,25.88,5.06,14.94a1.5,1.5,0,0,0-2.12,2.12l12,12a1.5,1.5,0,0,0,2.12,0Z" />
    </svg>
  );

  return props.rotate !== undefined ? (
    <span
      style={{
        display: 'inline-block',
        lineHeight: '0',
        transform: `rotate(${props.rotate}deg)`,
        transitionDuration: `${props.duration || 200}ms`,
      }}
    >
      {icon}
    </span>
  ) : (
    icon
  );
}
