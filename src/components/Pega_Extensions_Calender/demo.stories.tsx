
/* eslint-disable react/jsx-no-useless-fragment */
// @ts-nocheck
import { withKnobs, text, select, boolean} from '@storybook/addon-knobs';

import PegaExtensionsCalender from './index';

import calendarData from './mock';

export default {
  title: 'PegaExtensionsCalender',
  decorators: [withKnobs],
  component: PegaExtensionsCalender
};

if (!window.PCore) {
  window.PCore = {};
}

window.PCore.getEvents = () =>{
  return {
    getTimeZone: () => 'local'
  };
};

window.PCore.getEvents = () =>{
  return {
    getCaseEvent: () => {
      return {
        ASSIGNMENT_SUBMISSION: 'ASSIGNMENT_SUBMISSION'
      };
    }
  };
};

window.PCore.getPubSubUtils = () =>{
  {
    return {
      subscribe: () => {
        /* nothing */
      },
      unsubscribe: () => {
        /* nothing */
      }
    };
  }
};

window.PCore.getSemanticUrlUtils = () =>{
  return {
    getResolvedSemanticURL: () => {
      return undefined;
    },
    getActions: () => {
      return {
        ACTION_OPENWORKBYHANDLE: 'openWorkByHandle'
      };
    }
  };
};

window.PCore.getLocaleUtils = () => {
  return {
    getLocaleValue: value => {
      return value;
    }
  };
};

window.PCore.getDataApiUtils = () => {
  return {
    getData: () => {
      return new Promise(resolve => {
        resolve(calendarData);
      });
    }
  };
};

export const BasePegaExtensionsCalender = () => {

  const props = {
    dataPage: '',
    title: text('Heading', 'Calendar'),
    createClassname: text('Create classname', ''),
    defaultViewMode: select(`View mode`, { Monthly: 'Monthly', Weekly: 'Weekly', Daily: 'Daily' }),
    nowIndicator: boolean(`Now indicator`, true),
    weekendIndicator: boolean(`Show week-ends`, true),
    getPConnect: () => {
      return {
        getValue: value => {
          return value;
        },
        getContextName: () => {
          return 'app/primary_1';
        },
        getLocalizedValue: value => {
          return value;
        },
        getActionsApi: () => {
          return {
            openWorkByHandle: () => {
              /* nothing */
            },
            createWork: classname => {
              // eslint-disable-next-line no-alert
              alert(`Create case type with classname:${classname}`);
            },
            updateFieldValue: () => {
              /* nothing */
            },
            triggerFieldChange: () => {
              /* nothing */
            },
            showCasePreview: () => {
              /* nothing */
            }
          };
        },
        ignoreSuggestion: () => {
          /* nothing */
        },
        acceptSuggestion: () => {
          /* nothing */
        },
        setInheritedProps: () => {
          /* nothing */
        },
        resolveConfigProps: () => {
          /* nothing */
        }
      };
    }
  };


return (
    <>
      <PegaExtensionsCalender {...props} />
    </>
  );
};
