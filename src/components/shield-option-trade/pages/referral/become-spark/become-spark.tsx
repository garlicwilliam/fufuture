import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './become-spark.module.less';
import { VerticalItem } from '../../../../common/content/vertical-item';
import { fontCss } from '../../../../i18n/font-switch';
import { FixPadding } from '../../../../common/content/fix-padding';
import { SparkStep } from './step';
import step1 from '../../../../../assets/imgs/trade/step1.svg';
import step2 from '../../../../../assets/imgs/trade/step2.svg';
import step3 from '../../../../../assets/imgs/trade/step3.svg';
import { I18n } from '../../../../i18n/i18n';
import { SldDecPercent } from '../../../../../util/decimal';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import { SLD_ENV_CONF } from '../../../const/env';

type IState = {
  isMobile: boolean;
  brokerPortion: SldDecPercent;
};
type IProps = {};

export class BecomeSpark extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    brokerPortion: SldDecPercent.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('brokerPortion', S.Option.Params.Broker.Portion);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperSpark)}>
        <div className={styleMr(styles.become)}>
          <div className={styleMr(styles.title, fontCss.bold)}>
            <I18n id={'trade-spark-become'} params={{ project: SLD_ENV_CONF.Brand.Project }} />
          </div>

          <div className={styleMr(styles.desc)}>
            <I18n id={'trade-spark-become-desc'} />
          </div>

          <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
            <VerticalItem
              label={this.state.brokerPortion.percentFormat({ fix: 1, removeZero: true }) + '%'}
              labelClassName={styleMr(styles.rate, fontCss.bold)}
              valueClassName={styleMr(styles.desc)}
              gap={'10px'}
            >
              <I18n id={'trade-spark-commission-rate'} />
            </VerticalItem>
          </FixPadding>
        </div>

        <FixPadding top={100} bottom={60} mobTop={80} mobBottom={40}>
          <div className={styleMr(styles.only3, fontCss.bold)}>
            <I18n id={'trade-spark-steps'} />
          </div>
        </FixPadding>

        <div className={styleMr(styles.steps)}>
          <SparkStep
            icon={step1}
            title={
              <span>
                1. <I18n id={'trade-spark-step-1'} />
              </span>
            }
            desc={<I18n id={'trade-spark-step-1-desc'} params={{ project: SLD_ENV_CONF.Brand.Project }} />}
          />

          <SparkStep
            icon={step2}
            title={
              <span>
                2. <I18n id={'trade-spark-step-2'} />
              </span>
            }
            desc={<I18n id={'trade-spark-step-2-desc'} />}
          />

          <SparkStep
            icon={step3}
            title={
              <span>
                3. <I18n id={'trade-spark-step-3'} />
              </span>
            }
            desc={<I18n id={'trade-spark-step-3-desc'} />}
          />
        </div>
      </div>
    );
  }
}
