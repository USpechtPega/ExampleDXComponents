
/* eslint-disable react/jsx-no-useless-fragment */
// @ts-nocheck
import { withKnobs } from '@storybook/addon-knobs';

import PegaExtensionsIbanTextField from './index';

import { stateProps, fieldMetadata, configProps } from './mock';

export default {
  title: 'PegaExtensionsIbanTextField',
  decorators: [withKnobs],
  component: PegaExtensionsIbanTextField
};

export const BasePegaExtensionsIbanTextField = () => {

  const props = {
    value: configProps.value,
    placeholder: configProps.placeholder,
    label: configProps.label,
    helperText: configProps.helperText,
    testId: configProps.testId,
    hasSuggestions: configProps.hasSuggestions,
    fieldMetadata,

    getPConnect: () => {
      return {
        getStateProps: () => {
          return stateProps;
        },
        getActionsApi: () => {
          return {
            updateFieldValue: () => {/* nothing */},
            triggerFieldChange: () => {/* nothing */}
          };
        },
        ignoreSuggestion: () => {/* nothing */},
        acceptSuggestion: () => {/* nothing */},
        setInheritedProps: () => {/* nothing */},
        resolveConfigProps: () => {/* nothing */}
      };
    }
  };

  return (
    <>
      <PegaExtensionsIbanTextField {...props} />
    </>
  );
};
