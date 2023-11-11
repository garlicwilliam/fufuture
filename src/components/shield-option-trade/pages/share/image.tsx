import svgLogo from '../../../../../src/assets/imgs/logo/fufuture-dark.svg';
import svgDecorate from '../../../../../src/assets/imgs/poster/decorate.svg';

const logo: HTMLImageElement = new Image(363, 83);
logo.src = svgLogo;

export const logoImg: HTMLImageElement = logo;

// -------------------------------------------------------------------------------

const decorate: HTMLImageElement = new Image(102, 87);
decorate.src = svgDecorate;

export const decImg: HTMLImageElement = decorate;