import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  Status,
  Link,
  FieldValueList,
  Card,
  CardHeader,
  CardContent,
  Button
} from '@pega/cosmos-react-core';
import type { PConnFieldProps } from './PConnProps';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';


import StyledPegaExtensionsCalenderWrapper from './styles';

// interface for props
interface PegaExtensionsCalenderProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  title: string;
  dataPage: string;
  createClassname: string;
  defaultViewMode: string;
  nowIndicator: boolean;
  weekendIndicator: boolean;
}

const VIEW_TYPE = {
  DAY: 'timeGridDay',
  WEEK: 'timeGridWeek',
  MONTH: 'dayGridMonth'
};


// Duplicated runtime code from Constellation Design System Component

// props passed in combination of props from property panel (config.json) and run time props from Constellation
// any default values in config.pros should be set in defaultProps at bottom of this file
export default function PegaExtensionsCalender(props: PegaExtensionsCalenderProps) {
  const { getPConnect,
    title = '',
    dataPage = '',
    createClassname = '',
    defaultViewMode = 'Monthly',
    nowIndicator = true,
    weekendIndicator = true,
  } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<appointment[]>();
  const calendarRef = useRef(null);
  const pConn = getPConnect();
  const context = pConn.getContextName();
  const caseProp: string = PCore.getConstants().CASE_INFO.CASE_INFO_ID;
  const caseID = pConn.getValue(caseProp, '');

  interface DateInfo {
    end: string;
    start: string;
    startStr: string;
    view: {
      type: string; // Assuming type is a string
    }
  }


  const dateInfoString = localStorage.getItem('fullcalendar');
  let dateInfo: DateInfo = {
    end: '',
    start: '',
    startStr: '',
    view: {
      type: ''
    }
  };
  if (dateInfoString) {
    dateInfo = JSON.parse(dateInfoString);
    if (dateInfo != null && dateInfo.view.type === VIEW_TYPE.MONTH) {
      /* If showing month - find the date in the middle to get the month */
      const middle = new Date(
        (new Date(dateInfo.end)).getTime() - ((new Date(dateInfo.end)).getTime() - (new Date(dateInfo.start)).getTime()) / 2
      );
      dateInfo.startStr = `${middle.toISOString().substring(0, 7)}-01`;
    }
  }

  // const caseProp: string = PCore.getConstants().CASE_INFO.CASE_INFO_ID;
  // const caseID = pConn.getValue(caseProp, '');
  //const context = pConn.getContextName();

  /*const columns = [
    { renderer: 'date', label: pConn.getLocalizedValue('Date', '', '') },
    { renderer: 'description', label: pConn.getLocalizedValue('Description', '', '') },
    { renderer: 'user', label: pConn.getLocalizedValue('Performed by', '','') }
  ];*/


  const getDefaultView = () => {
    if (dateInfo !== null && dateInfo.view && dateInfo.view.type) {
      /* If the context is persisted in session storage - then used this info as default view */
      return dateInfo.view.type;
    }
    let defaultView;
    switch (defaultViewMode) {
      case 'Monthly':
        defaultView = VIEW_TYPE.MONTH;
        break;
      case 'Weekly':
        defaultView = VIEW_TYPE.WEEK;
        break;
      case 'Daily':
        defaultView = VIEW_TYPE.DAY;
        break;
      default:
        defaultView = VIEW_TYPE.MONTH;
    }
    return defaultView;
  };

  const addNewEvent = () => {
    if (createClassname) {
      getPConnect().getActionsApi().createWork(createClassname);
    }
  };

  const renderEventContent = eventInfo => {
    const obj = eventInfo.event._def.extendedProps.item;
    let isdayGrid = true;
    if (eventInfo.view.type === VIEW_TYPE.DAY || eventInfo.view.type === VIEW_TYPE.WEEK) {
      isdayGrid = false;
    }
    const eventDateStr = `${obj.StartTime.substring(0, 5)} - ${obj.EndTime.substring(0, 5)}`;


    const linkURL = window.PCore.getSemanticUrlUtils().getResolvedSemanticURL(
      // @ts-ignore
      window.PCore.getSemanticUrlUtils().getActions().ACTION_OPENWORKBYHANDLE,
      { caseClassName: obj.pxObjClass },
      { workID: obj.pyID }
    );
    const linkEl = (
      <Link
        href={linkURL}
        previewable
        style={
          isdayGrid
            ? {}
            : {
              color: '#FFF'
            }
        }
        onPreview={() => {
          getPConnect().getActionsApi().showCasePreview(encodeURI(eventInfo.event.id), {
            caseClassName: obj.pxObjClass
          });
        }}
        onClick={e => {
          /* for links - need to set onClick for spa to avoid full reload - (cmd | ctrl) + click for opening in new tab */
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            getPConnect().getActionsApi().openWorkByHandle(obj.pzInsKey, obj.pxObjClass);
          }
        }}
      >
        {isdayGrid ? obj.pyID : `${eventInfo.event.title} - ${eventDateStr}`}
      </Link>
    );
    if (!isdayGrid) {
      return linkEl;
    }
    return (
      <div
        style={{
          border: '1px solid #ccc',
          padding: '4px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <Text variant='h3'>{eventInfo.event.title}</Text>
        <FieldValueList
          variant='inline'
          style={{
            gap: 'normal'
          }}
          fields={[
            {
              id: 'id',
              name: 'Case ID',
              value: linkEl
            },
            {
              id: 'time',
              name: 'time',
              value: eventDateStr
            },
            {
              id: 'status',
              name: 'Status',
              value: <Status variant='success'>{obj.pyStatusWork}</Status>
            }
          ]}
        />
      </div>
    );
  };

  interface appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    item: any;
  }

  interface Item {
    pzInsKey: string;
    pyLabel: string;
    SessionDate: string;
    StartTime: string;
    EndTime: string;
    // Add more properties if necessary
  }

  // Assuming response data structure
  interface ResponseData {
    data: {
      data: Item[] | null;
    }
    // Add more properties if necessary
  }



  const loadEvents = () => {

    // @ts-ignore
    const result = window.PCore.getDataApiUtils().getData(dataPage);
    if (result instanceof Promise) {
      result.then((response: ResponseData) => {
        if (response.data.data !== null) {
          const tmpevents: any[] = [];
          response.data.data.forEach((item: Item) => {
            tmpevents.push({
              id: item.pzInsKey,
              title: item.pyLabel,
              start: new Date(`${item.SessionDate}T${item.StartTime}`),
              end: new Date(`${item.SessionDate}T${item.EndTime}`),
              item
            });
          });
          setEvents(tmpevents);
        }
      }).catch(error => console.error(error));
    };
  }

  const handleEventClick = eventClickInfo => {
    const eventDetails = eventClickInfo.event.extendedProps;
    getPConnect()
      .getActionsApi()
      .openWorkByHandle(eventDetails.item.pzInsKey, eventDetails.item.pxObjClass);
  };

  const handleDateChange = objInfo => {
    localStorage.setItem('fullcalendar', JSON.stringify(objInfo));
  };



  /* Subscribe to changes to the assignment case */
  useEffect(() => {
    window.PCore.getPubSubUtils().subscribe(
      // @ts-ignore
      window.PCore.getEvents().getCaseEvent().ASSIGNMENT_SUBMISSION,
      () => {
        /* If an assignment is updated - force a reload of the events */
        loadEvents();
      },
      'ASSIGNMENT_SUBMISSION'
    );
    return () => {
      window.PCore.getPubSubUtils().unsubscribe(
        // @ts-ignore
        window.PCore.getEvents().getCaseEvent().ASSIGNMENT_SUBMISSION,
        'ASSIGNMENT_SUBMISSION'
      );
    };
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);


  return (
    <Card>
      <CardHeader
        actions={
          createClassname ? (
            <Button variant='primary' onClick={addNewEvent}>
              Create
            </Button>
          ) : undefined
        }
      >
        <Text variant='h2'>{title}</Text>
      </CardHeader>
      <CardContent>
        <FullCalendar
          ref={calendarRef}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: `${VIEW_TYPE.MONTH},${VIEW_TYPE.WEEK},${VIEW_TYPE.DAY}`
          }}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView={getDefaultView()}
          selectable
          nowIndicator={nowIndicator}
          weekends={weekendIndicator}
          allDayText='All day'
          slotMinTime='07:00:00'
          slotMaxTime='19:00:00'
          height={650}
          slotEventOverlap={false}
          events={events}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          datesSet={handleDateChange}
          initialDate={
            dateInfo !== null && dateInfo.startStr ? dateInfo.startStr.substring(0, 10) : undefined
          }
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      </CardContent>
    </Card>
  );


}

