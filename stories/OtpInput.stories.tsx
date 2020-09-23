import React from 'react';
import { Meta } from '@storybook/react';
import OtpInput from '../src/index';

const meta: Meta = {
  title: 'OtpInput',
};

export default meta;

export const Default = () => {
  const [value, setValue] = React.useState('');

  const handleChange = (otp: string) => {
    setValue(otp);
  };

  return <OtpInput onChange={handleChange} value={value} />;
};
