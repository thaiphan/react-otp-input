import React from 'react';

// keyCode constants
const BACKSPACE = 8;
const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
const DELETE = 46;
const SPACEBAR = 32;

// Doesn't really check if it's a style Object
// Basic implementation to check if it's not a string
// of classNames and is an Object
// TODO: Better implementation
const isStyleObject = (obj?: object | string) => typeof obj === 'object';

const getClasses = (...classes: any[]) =>
  classes.filter(c => !isStyleObject(c) && c !== false).join(' ');

interface SingleOtpInputProps {
  disabledStyle?: object | string;
  errorStyle?: object | string;
  focus: boolean;
  focusStyle?: object | string;
  hasErrored?: boolean;
  inputStyle?: object | string;
  isDisabled?: boolean;
  isInputNum?: boolean;
  isLastChild: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onInput?: (e: any) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  separator?: any;
  value?: string;
}

const SingleOtpInput = ({
  separator,
  isLastChild,
  inputStyle,
  focus,
  isDisabled,
  hasErrored,
  errorStyle,
  focusStyle,
  disabledStyle,
  isInputNum,
  value,
  ...rest
}: SingleOtpInputProps) => {
  const input = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (focus) {
      input.current?.focus();
      input.current?.select();
    }
  }, [focus]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        autoComplete="off"
        style={Object.assign(
          { width: '1em', textAlign: 'center' },
          isStyleObject(inputStyle) && inputStyle,
          focus && isStyleObject(focusStyle) && focusStyle,
          isDisabled && isStyleObject(disabledStyle) && disabledStyle,
          hasErrored && isStyleObject(errorStyle) && errorStyle
        )}
        className={getClasses(
          inputStyle,
          focus && focusStyle,
          isDisabled && disabledStyle,
          hasErrored && errorStyle
        )}
        type={isInputNum ? 'tel' : 'text'}
        maxLength={1}
        ref={input}
        disabled={isDisabled}
        value={value ? value : ''}
        {...rest}
      />
      {!isLastChild && separator}
    </div>
  );
};

interface OtpInputProps {
  numInputs: number;
  onChange: (otp: string) => void;
  separator?: any;
  containerStyle?: object | string;
  inputStyle?: object | string;
  focusStyle?: object | string;
  isDisabled?: boolean;
  disabledStyle?: object | string;
  hasErrored?: boolean;
  errorStyle?: object | string;
  shouldAutoFocus?: boolean;
  isInputNum?: boolean;
  value?: string;
}

interface OtpInputState {
  activeInput: number;
  otp?: string[];
}

class OtpInput extends React.Component<OtpInputProps, OtpInputState> {
  static defaultProps = {
    numInputs: 4,
    onChange: (otp: string): void => console.log(otp),
    isDisabled: false,
    shouldAutoFocus: false,
    value: '',
  };

  state = {
    activeInput: this.props.shouldAutoFocus ? 0 : -1,
  };

  getOtpValue = () =>
    this.props.value ? this.props.value.toString().split('') : [];

  // Helper to return OTP from input
  handleOtpChange = (otp: string[]) => {
    const { onChange } = this.props;
    const otpValue = otp.join('');

    onChange(otpValue);
  };

  isInputValueValid = (value: string) => {
    const isTypeValid = this.props.isInputNum
      ? !isNaN(parseInt(value, 10))
      : typeof value === 'string';

    return isTypeValid && value.trim().length === 1;
  };

  // Focus on input by index
  focusInput = (input: number) => {
    const { numInputs } = this.props;
    const activeInput = Math.max(Math.min(numInputs - 1, input), 0);

    this.setState({ activeInput });
  };

  // Focus on next input
  focusNextInput = () => {
    const { activeInput } = this.state;
    this.focusInput(activeInput + 1);
  };

  // Focus on previous input
  focusPrevInput = () => {
    const { activeInput } = this.state;
    this.focusInput(activeInput - 1);
  };

  // Change OTP value at focused input
  changeCodeAtFocus = (value: string) => {
    const { activeInput } = this.state;
    const otp = this.getOtpValue();
    otp[activeInput] = value[0];

    this.handleOtpChange(otp);
  };

  // Handle pasted OTP
  handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { numInputs } = this.props;
    const { activeInput } = this.state;
    const otp = this.getOtpValue();

    // Get pastedData in an array of max size (num of inputs - current position)
    const pastedData = e.clipboardData
      .getData('text/plain')
      .slice(0, numInputs - activeInput)
      .split('');

    // Paste data from focused input onwards
    for (let pos = 0; pos < numInputs; ++pos) {
      if (pos >= activeInput && pastedData.length > 0) {
        otp[pos] = pastedData.shift() as string;
      }
    }

    this.handleOtpChange(otp);
  };

  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (this.isInputValueValid(value)) {
      this.changeCodeAtFocus(value);
    }
  };

  // Handle cases of backspace, delete, left arrow, right arrow, space
  handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === BACKSPACE || e.key === 'Backspace') {
      e.preventDefault();
      this.changeCodeAtFocus('');
      this.focusPrevInput();
    } else if (e.keyCode === DELETE || e.key === 'Delete') {
      e.preventDefault();
      this.changeCodeAtFocus('');
    } else if (e.keyCode === LEFT_ARROW || e.key === 'ArrowLeft') {
      e.preventDefault();
      this.focusPrevInput();
    } else if (e.keyCode === RIGHT_ARROW || e.key === 'ArrowRight') {
      e.preventDefault();
      this.focusNextInput();
    } else if (
      e.keyCode === SPACEBAR ||
      e.key === ' ' ||
      e.key === 'Spacebar' ||
      e.key === 'Space'
    ) {
      e.preventDefault();
    }
  };

  // The content may not have changed, but some input took place hence change the focus
  handleOnInput = (e: any) => {
    if (this.isInputValueValid(e.target.value)) {
      this.focusNextInput();
    } else {
      // This is a workaround for dealing with keyCode "229 Unidentified" on Android.

      if (!this.props.isInputNum) {
        const { nativeEvent } = e;

        if (
          nativeEvent.data === null &&
          nativeEvent.inputType === 'deleteContentBackward'
        ) {
          e.preventDefault();
          this.changeCodeAtFocus('');
          this.focusPrevInput();
        }
      }
    }
  };

  renderInputs = () => {
    const { activeInput } = this.state;
    const {
      numInputs,
      inputStyle,
      focusStyle,
      separator,
      isDisabled,
      disabledStyle,
      hasErrored,
      errorStyle,
      isInputNum,
    } = this.props;
    const otp = this.getOtpValue();
    const inputs = [];

    for (let i = 0; i < numInputs; i++) {
      inputs.push(
        <SingleOtpInput
          key={i}
          focus={activeInput === i}
          value={otp && otp[i]}
          onChange={this.handleOnChange}
          onKeyDown={this.handleOnKeyDown}
          onInput={this.handleOnInput}
          onPaste={this.handleOnPaste}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            this.setState({ activeInput: i });
            e.target.select();
          }}
          onBlur={() => this.setState({ activeInput: -1 })}
          separator={separator}
          inputStyle={inputStyle}
          focusStyle={focusStyle}
          isLastChild={i === numInputs - 1}
          isDisabled={isDisabled}
          disabledStyle={disabledStyle}
          hasErrored={hasErrored}
          errorStyle={errorStyle}
          isInputNum={isInputNum}
        />
      );
    }

    return inputs;
  };

  render() {
    const { containerStyle } = this.props;

    return (
      <div
        style={Object.assign(
          { display: 'flex' },
          isStyleObject(containerStyle) && containerStyle
        )}
        className={
          !isStyleObject(containerStyle) ? (containerStyle as string) : ''
        }
      >
        {this.renderInputs()}
      </div>
    );
  }
}

export default OtpInput;
