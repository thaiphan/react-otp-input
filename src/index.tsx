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
  numInputs?: number;
  onChange?: (otp: string) => void;
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

const OtpInput: React.FC<OtpInputProps> = ({
  containerStyle,
  disabledStyle,
  errorStyle,
  focusStyle,
  hasErrored,
  inputStyle,
  isDisabled = false,
  isInputNum,
  numInputs = 4,
  onChange = (otp: string): void => console.log(otp),
  separator,
  shouldAutoFocus = false,
  value = '',
}) => {
  const [activeInput, setActiveInput] = React.useState(
    shouldAutoFocus ? 0 : -1
  );

  const getOtpValue = () => (value ? value.toString().split('') : []);

  // Helper to return OTP from input
  const handleOtpChange = (otp: string[]) => {
    const otpValue = otp.join('');

    if (onChange) {
      onChange(otpValue);
    }
  };

  const isInputValueValid = (value: string) => {
    const isTypeValid = isInputNum
      ? !isNaN(parseInt(value, 10))
      : typeof value === 'string';

    return isTypeValid && value.trim().length === 1;
  };

  // Focus on input by index
  const focusInput = (input: number) => {
    setActiveInput(Math.max(Math.min(numInputs - 1, input), 0));
  };

  // Focus on next input
  const focusNextInput = () => {
    focusInput(activeInput + 1);
  };

  // Focus on previous input
  const focusPrevInput = () => {
    focusInput(activeInput - 1);
  };

  // Change OTP value at focused input
  const changeCodeAtFocus = (value: string) => {
    const otp = getOtpValue();
    otp[activeInput] = value[0];

    handleOtpChange(otp);
  };

  // Handle pasted OTP
  const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const otp = getOtpValue();

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

    handleOtpChange(otp);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (isInputValueValid(value)) {
      changeCodeAtFocus(value);
    }
  };

  // Handle cases of backspace, delete, left arrow, right arrow, space
  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === BACKSPACE || e.key === 'Backspace') {
      e.preventDefault();
      changeCodeAtFocus('');
      focusPrevInput();
    } else if (e.keyCode === DELETE || e.key === 'Delete') {
      e.preventDefault();
      changeCodeAtFocus('');
    } else if (e.keyCode === LEFT_ARROW || e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPrevInput();
    } else if (e.keyCode === RIGHT_ARROW || e.key === 'ArrowRight') {
      e.preventDefault();
      focusNextInput();
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
  const handleOnInput = (e: any) => {
    if (isInputValueValid(e.target.value)) {
      focusNextInput();
    } else {
      // This is a workaround for dealing with keyCode "229 Unidentified" on Android.

      if (!isInputNum) {
        const { nativeEvent } = e;

        if (
          nativeEvent.data === null &&
          nativeEvent.inputType === 'deleteContentBackward'
        ) {
          e.preventDefault();
          changeCodeAtFocus('');
          focusPrevInput();
        }
      }
    }
  };

  const renderInputs = () => {
    const otp = getOtpValue();
    const inputs = [];

    for (let i = 0; i < numInputs; i++) {
      inputs.push(
        <SingleOtpInput
          key={i}
          focus={activeInput === i}
          value={otp && otp[i]}
          onChange={handleOnChange}
          onKeyDown={handleOnKeyDown}
          onInput={handleOnInput}
          onPaste={handleOnPaste}
          onFocus={() => {
            setActiveInput(i);
          }}
          onBlur={() => setActiveInput(-1)}
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
      {renderInputs()}
    </div>
  );
};

export default OtpInput;
