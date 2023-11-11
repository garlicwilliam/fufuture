/// <reference types="react-scripts" />

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'locale/i18n';

declare module 'rc-tween-one/lib/plugin/PathPlugin';

declare module 'rc-tween-one/lib/plugin/SvgMorphPlugin';
