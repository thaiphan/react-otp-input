import React from 'react';
import { Meta } from '@storybook/react';
import OtpInput from '../src/index';

const meta: Meta = {
  title: 'OtpInput',
};

export default meta;

export const Default = () => {
  return <OtpInput />;
};
