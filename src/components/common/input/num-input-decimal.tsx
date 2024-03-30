import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../util/string';
import styles from './num-input-decimal.module.less';
import React, { BaseSyntheticEvent, ReactNode } from 'react';
import { SldDecimal } from '../../../util/decimal';
import { BehaviorSubject, Subject, combineLatest, switchMap, of, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Visible } from '../../builtin/hidden';
import { fontCss } from '../../i18n/font-switch';

type IState = {
  isMobile: boolean;
  isFocus: boolean;
  isError: boolean;
  errorType: ErrorType | null;
};
type IProps = {
  originDecimal: number;
  onChange?: (value: SldDecimal | null) => void;
  doChangeIfError?: boolean;
  onErrorChange?: (isError: boolean, errType?: ErrorType | null) => void;
  onFocus?: (isFocus: boolean) => void;
  blur?: any;

  isDark?: boolean;
  noBorder?: boolean;
  align?: 'left' | 'right';
  className?: string;
  inputClassName?: string;
  parentClassName?: string;
  banDefaultStyle?: boolean;
  forceError?: boolean;
  disabled?: boolean;

  prefix?: ReactNode;
  suffix?: ReactNode;
  placeholder?: string;

  value?: SldDecimal | null;
  min?: SldDecimal;
  minIllegal?: boolean;
  max?: SldDecimal;
  maxIllegal?: boolean;
  mustInt?: boolean;
  fix?: number;
  allowNegative?: boolean;
  highlight?: boolean;
};
type ValueCondition = {
  value?: SldDecimal | null;
  min?: SldDecimal;
  minIllegal?: boolean;
  max?: SldDecimal;
  maxIllegal?: boolean;
  mustInt?: boolean;
  fix?: number;
  decimal: number;
};
enum ErrorType {
  NaN = 'NaN',
  Max = 'Max',
  Min = 'Min',
  Dec = 'Decimal',
}

export class DecimalNumInput extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isFocus: false,
    isError: false,
    errorType: null,
  };

  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();
  private valueCondition: BehaviorSubject<ValueCondition | null> = new BehaviorSubject<ValueCondition | null>(null);
  private inputString: Subject<string> = new Subject<string>();
  private outputValue: BehaviorSubject<SldDecimal | null | undefined> = new BehaviorSubject<
    SldDecimal | null | undefined
  >(undefined);

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.disableWheel();
    this.updateCondition();

    this.sub(this.watchValueConditionChange());
    this.sub(this.watchOutput());
  }

  componentWillUnmount() {
    this.valueCondition.complete();
    this.inputString.complete();
    this.outputValue.complete();

    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    const isValueSame: boolean =
      prevProps.value === this.props.value ||
      (!!prevProps.value && !!this.props.value && this.props.value.eq(prevProps.value));

    const isMaxSame: boolean =
      prevProps.max === this.props.max || (!!prevProps.max && !!this.props.max && prevProps.max.eq(this.props.max));

    const isMinSame: boolean =
      prevProps.min === this.props.min || (!!prevProps.min && !!this.props.min && prevProps.min.eq(this.props.min));

    const isValue = !isValueSame;
    const isMax = !isMaxSame;
    const isMaxIllegal = prevProps.maxIllegal !== this.props.maxIllegal;
    const isMin = !isMinSame;
    const isMinIllegal = prevProps.minIllegal !== this.props.minIllegal;
    const isMustInt = prevProps.mustInt !== this.props.mustInt;
    const isFixChange = prevProps.fix !== this.props.fix;
    const isDecimalChange = prevProps.originDecimal !== this.props.originDecimal;

    if (isValue || isMax || isMaxIllegal || isMin || isMinIllegal || isMustInt || isFixChange || isDecimalChange) {
      this.updateCondition();
    }

    if (this.props.blur !== prevProps.blur) {
      this.inputRef.current?.blur();
    }
  }

  private disableWheel() {
    if (this.inputRef.current) {
      this.inputRef.current.addEventListener('wheel', (event: MouseEvent) => {
        event.preventDefault();
      });
    }
  }

  private updateCondition() {
    const condition: ValueCondition = {
      value: this.props.value,
      min: this.props.min,
      minIllegal: this.props.minIllegal,
      max: this.props.max,
      maxIllegal: this.props.maxIllegal,
      mustInt: this.props.mustInt,
      fix: this.props.fix,
      decimal: this.props.originDecimal,
    };

    this.valueCondition.next(condition);
  }

  private watchValueConditionChange() {
    const condition$ = this.valueCondition;
    const value$ = this.inputString;

    return condition$.pipe(
      filter(Boolean),
      switchMap((valCondition: ValueCondition) => {
        const checkResult: null | ErrorType | ValueCondition = this.checkValue(valCondition);

        if (checkResult === null || _.has(checkResult, 'value')) {
          this.updateErrorState(null);

          this.syncValueString(valCondition.value || null);
        } else if (checkResult === ErrorType.Dec) {
          if (valCondition.value) {
            const newVal = SldDecimal.fromE18(valCondition.value.toE18(), valCondition.decimal);
            this.outputValue.next(newVal);

            valCondition.value = newVal;
          }
        } else if (checkResult === ErrorType.Min || checkResult === ErrorType.Max) {
          this.syncValueString(valCondition.value!);
          this.updateErrorState(checkResult as ErrorType);
        } else {
          this.updateErrorState(checkResult as ErrorType);
        }

        return of(valCondition);
      }),
      switchMap((valCondition: ValueCondition) => {
        return combineLatest([value$, of(valCondition)]);
      }),
      tap(([value, valCondition]: [string, ValueCondition]) => {
        // if user not input value, this will never be called because value$ is a subject
        const newValue: SldDecimal | null = value === '' ? null : SldDecimal.fromNumeric(value, valCondition.decimal);

        const newCondition: ValueCondition = Object.assign({}, valCondition, { value: newValue });
        const checkResult: null | ErrorType | ValueCondition = this.checkValue(newCondition);

        if (checkResult === null || _.has(checkResult, 'value')) {
          this.updateErrorState(null);

          this.outputValue.next(newCondition.value || null);
        } else {
          this.updateErrorState(checkResult as ErrorType);

          if (this.props.doChangeIfError) {
            this.outputValue.next(newCondition.value || null);
          }
        }
      })
    );
  }

  private watchOutput(): Observable<any> {
    return this.outputValue.pipe(
      filter((outValue: SldDecimal | null | undefined) => outValue !== undefined),
      map((outVal: SldDecimal | null | undefined) => outVal as SldDecimal | null),
      tap((value: SldDecimal | null) => {
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      })
    );
  }

  private updateErrorState(errorType: ErrorType | null) {
    const isError: boolean = errorType !== null;

    const errState: Partial<IState> = {};

    if (this.state.isError !== isError) {
      errState.isError = isError;
    }
    if (this.state.errorType !== errorType) {
      errState.errorType = errorType;
    }

    if (!_.isEmpty(errState)) {
      this.updateState(errState);
    }

    if (this.props.onErrorChange) {
      this.props.onErrorChange(isError, errorType);
    }
  }

  private syncValueString(nextValue: SldDecimal | null) {
    if (this.inputRef.current) {
      const curValueString: string = this.inputRef.current.value;

      if ((nextValue?.toNumeric() || '') === curValueString) {
        return;
      }

      if (nextValue === null) {
        this.syncCorrectValueString('');
        return;
      }

      const curValue = SldDecimal.fromNumeric(curValueString, this.props.originDecimal);
      if (curValue.toE18().eq(nextValue.toE18()) && curValueString !== '') {
        return;
      }

      this.syncCorrectValueString(nextValue.toNumeric(true));
    }
  }

  private syncCorrectValueString(valueString: string) {
    if (this.inputRef.current) {
      if (this.inputRef.current.value === valueString) {
        return;
      }

      this.inputRef.current.value = valueString;
      this.inputRef.current.type = 'text';
      this.inputRef.current.selectionStart = valueString.length;
      this.inputRef.current.type = 'number';
    }
  }

  private checkValue(condition: ValueCondition): null | ErrorType | ValueCondition {
    if (!condition.value) {
      return null;
    }

    if (condition.decimal !== condition.value.getOriginDecimal()) {
      return ErrorType.Dec;
    }

    if (condition.max) {
      const isErr = condition.maxIllegal
        ? condition.value.toE18().gte(condition.max.toE18())
        : condition.value.toE18().gt(condition.max.toE18());
      if (isErr) {
        return ErrorType.Max;
      }
    }

    if (condition.min) {
      const isErr = condition.minIllegal
        ? condition.value.toE18().lte(condition.min.toE18())
        : condition.value.toE18().lt(condition.min.toE18());

      if (isErr) {
        return ErrorType.Min;
      }
    }

    return condition;
  }

  private correctValue(valueString: string): string {
    valueString = valueString.toLowerCase();
    let finalValString: string | null = null;

    // check e
    if (valueString.toLowerCase().indexOf('e') >= 0) {
      finalValString = valueString.replace('e', '');
      this.syncCorrectValueString(finalValString);
      return finalValString;
    }

    // check negative
    if (this.props.allowNegative !== true) {
      if (valueString.indexOf('-') >= 0) {
        finalValString = valueString.replace('-', '');
        this.syncCorrectValueString(finalValString);
        return finalValString;
      }
    }

    // check integer
    if (this.props.mustInt || this.props.fix === 0) {
      const parts = valueString.split('.');
      finalValString = parts[0];

      if (finalValString !== valueString) {
        this.syncCorrectValueString(finalValString);
        return finalValString;
      }
    }

    if (valueString.startsWith('0') && valueString.indexOf('.') < 0) {
      const parts: string[] = valueString.split('.');
      const intPart = _.trimStart(parts[0], '0');
      const intPartStr = intPart.length === 0 ? '0' : intPart;

      let finalStr = valueString;
      if (parts[1]) {
        finalStr = intPartStr + '.' + parts[1];
      } else {
        finalStr = intPartStr;
      }

      if (finalStr !== valueString) {
        this.syncCorrectValueString(finalStr);
        return finalStr;
      }
    }

    // check decimal
    const fixDecimal: number =
      this.props.fix !== undefined ? Math.min(this.props.fix, this.props.originDecimal) : this.props.originDecimal;

    if (valueString.indexOf('.') >= 0) {
      const parts = valueString.split('.');
      let int: string = parts[0];
      const dec: string = parts.length > 1 ? parts[1] : '';

      if (int.startsWith('0')) {
        int = _.trimStart(int, '0');
        if (int.length === 0) {
          int = '0';
        }
      }

      finalValString = int;

      if (dec.length > 0) {
        if (dec.length > fixDecimal) {
          finalValString += '.' + dec.substring(0, fixDecimal);
        } else {
          finalValString += '.' + dec;
        }
      }

      if (finalValString !== valueString) {
        this.syncCorrectValueString(finalValString);
        return finalValString;
      }
    }

    return valueString;
  }

  onFocus(isFocus: boolean) {
    this.updateState({ isFocus });
    if (this.props.onFocus) {
      this.props.onFocus(isFocus);
    }
  }

  onValueChange(event: BaseSyntheticEvent) {
    const form = (event.nativeEvent as InputEvent).target as HTMLInputElement;
    const inputString: string = form.value;

    const corrected: string = this.correctValue(inputString);
    this.inputString.next(corrected);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const hasPrefix: boolean = !!this.props.prefix;
    const hasSuffix: boolean = !!this.props.suffix;

    const darkCss: string = cssPick(this.props.isDark, styles.dark);
    const activeCss: string = cssPick(this.state.isFocus, styles.active);
    const alignCss: string = this.props.align === 'right' ? styles.pullRight : styles.pullLeft;
    const errorCss: string = cssPick(this.props.forceError || this.state.isError, styles.error);
    const noBorderCss: string = this.props.noBorder === true ? styles.noBorder : '';
    const highlightCss: string = cssPick(this.props.highlight, styles.highlight);

    const content = (
      <div
        className={styleMr(
          'sld_dec_num_input',
          cssPick(this.state.isFocus, 'sld_dec_num_input_active'),
          cssPick(this.props.forceError || this.state.isError, 'sld_dec_num_input_error'),
          cssPick(!this.props.banDefaultStyle, styles.wrapperDecimal),
          noBorderCss,
          highlightCss,
          darkCss,
          activeCss,
          errorCss,
          this.props.className
        )}
      >
        <Visible when={hasPrefix}>
          <div className={styleMr(styles.prefix, 'sld_input_prefix')}>{this.props.prefix}</div>
        </Visible>

        <input
          ref={this.inputRef}
          className={styleMr(
            styles.input,
            darkCss,
            alignCss,
            'sld_input',
            this.props.inputClassName,
            fontCss.mediumLatin,
            cssPick(this.props.align === 'right', 'sld_input_pull_right'),
            cssPick(this.props.align !== 'right', 'sld_input_pull_left')
          )}
          type={'number'}
          onFocus={() => this.onFocus(true)}
          onBlur={() => this.onFocus(false)}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
          onChange={this.onValueChange.bind(this)}
        />

        <Visible when={hasSuffix}>
          <div className={styleMr(styles.suffix, 'sld-input-suffix')}>{this.props.suffix}</div>
        </Visible>
      </div>
    );

    return this.props.parentClassName ? <div className={this.props.parentClassName}>{content}</div> : <>{content}</>;
  }
}
