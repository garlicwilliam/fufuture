import svgDecorate from '../../../../../src/assets/imgs/poster/decorate.svg';
import { SLD_ENV_CONF } from '../../const/env';

const logoSize = SLD_ENV_CONF.Logo.WebDark.size;
const logo = new Image(logoSize.w, logoSize.h);
logo.src = SLD_ENV_CONF.Logo.WebDark.url;

export const logoImg = logo;

export const logoDisSize = { w: logoSize.w * (40 / logoSize.h), h: 40 };

// -------------------------------------------------------------------------------

const decorate = new Image(102, 87);
decorate.src = svgDecorate;

export const decImg = decorate;
