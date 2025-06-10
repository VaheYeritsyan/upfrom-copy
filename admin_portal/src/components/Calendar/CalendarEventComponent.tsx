import React, { FC } from 'react';
import { Box, Tooltip } from '@mui/material';
import { EventImpl } from '@fullcalendar/core/internal';
import styles from '~/components/Calendar/calendar.module.scss';

type Props = {
  timeText: string;
  event: EventImpl;
  color?: string;
  isMonthView?: boolean;
};

export const CalendarEventComponent: FC<Props> = ({ timeText, event, color, isMonthView }) => {
  const { isCancelled } = event.extendedProps;
  const tooltipTitle = isCancelled ? 'The event is cancelled' : '';

  const cancelledOpacity = isMonthView ? 0.5 : 0.75;
  const sx = { opacity: isCancelled ? cancelledOpacity : 1 };

  return isMonthView ? (
    <Tooltip title={tooltipTitle} placement="left">
      <Box className={styles.calendarMonthEventContent}>
        <Box className="fc-daygrid-event-dot" sx={{ ...sx, borderColor: color }} />
        <Box className="fc-event-time" sx={sx}>
          {timeText}
        </Box>
        <Box className="fc-event-title" sx={sx}>
          {event.title}
        </Box>
      </Box>
    </Tooltip>
  ) : (
    <Tooltip title={tooltipTitle}>
      <Box className="fc-event-main-frame">
        <Box className="fc-event-title-container">
          <Box className="fc-event-title fc-sticky" sx={sx}>
            <strong>{event.title}</strong>
            <Box className="fc-event-time">{timeText}</Box>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
};
