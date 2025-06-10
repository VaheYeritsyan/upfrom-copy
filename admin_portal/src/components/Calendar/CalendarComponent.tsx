import React, { FC, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Paper, Tooltip, MenuItem, Divider } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Event, Team, Organization } from '@up-from/graphql-ap/genql';
import { Controller, useForm } from 'react-hook-form';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, MoreLinkArg, CalendarOptions } from '@fullcalendar/core';
import { getFullDate } from '~/util/date';
import { getColor, getContrastColor } from '~/util/color';
import { CalendarView } from '~/types/calendar';
import { MenuComponent } from '~/components/Menu/MenuComponent';
import { CalendarToolbarComponent, FormValues } from '~/components/Calendar/CalendarToolbarComponent';
import { IconButtonComponent } from '~/components/Button/IconButtonComponent';
import { CalendarEventDetailsModalComponent } from '~/components/Calendar/CalendarEventDetailsModalComponent';
import { CalendarEventComponent } from '~/components/Calendar/CalendarEventComponent';
import styles from './calendar.module.scss';

type Props = {
  isLoadingPast?: boolean;
  isLoadingUpcoming?: boolean;
  isTeamsLoading?: boolean;
  events: Event[];
  teams: Omit<Team, 'disabledUsers' | 'disabledUserIds' | 'members' | 'events'>[];
  organizations: Organization[];
  isOrganizationsLoading?: boolean;
};

type PreviewingEvent = Event & {
  color: string;
};

const views: { [K: string]: string } = {
  [CalendarView.MONTH]: 'Month',
  [CalendarView.WEEK]: 'Week',
  [CalendarView.DAY]: 'Day',
};

const viewsOptions = Object.keys(views);
const viewsValues = Object.fromEntries(viewsOptions.map(key => [views[key], key]));

const eventTimeFormat: CalendarOptions['eventTimeFormat'] = { hour: 'numeric', minute: '2-digit', meridiem: 'short' };
const calendarViews: CalendarOptions['views'] = {
  dayGridMonth: {
    eventContent: ({ event, timeText, borderColor }) => (
      <CalendarEventComponent timeText={timeText} event={event} color={borderColor} isMonthView />
    ),
  },
  timeGridWeek: {
    eventContent: ({ event, timeText }) => <CalendarEventComponent timeText={timeText} event={event} />,
    dayHeaderFormat: { weekday: 'long', day: 'numeric' },
  },
  timeGridDay: {
    eventContent: ({ event, timeText }) => <CalendarEventComponent timeText={timeText} event={event} />,
    dayHeaderFormat: { weekday: 'long', day: 'numeric' },
  },
};

export const CalendarComponent: FC<Props> = ({
  isLoadingPast,
  isLoadingUpcoming,
  isTeamsLoading,
  isOrganizationsLoading,
  organizations,
  teams,
  events,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const isMountedRef = useRef<boolean>();
  const calendarRef = useRef<FullCalendar>(null);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [previewingEvent, setPreviewingEvent] = useState<null | PreviewingEvent>(null);

  const defaultValues = useMemo(() => {
    const dateParam = searchParams.get('date');
    const viewParam = searchParams.get('view');

    return {
      date: dateParam ? new Date(dateParam) : new Date(),
      view: viewParam ? (viewsValues[viewParam] as CalendarView) : CalendarView.MONTH,
      team: undefined,
      organization: undefined,
    };
  }, []);

  const form = useForm<FormValues>({ defaultValues });
  const [date, view, team, organization] = form.watch(['date', 'view', 'team', 'organization']);

  const filteredEvents = useMemo(() => {
    if (team) return events.filter(event => event.team?.id === team.id);

    if (organization) {
      const orgTeamsIds = organization?.teams.map(({ id }) => id);
      return events.filter(event => orgTeamsIds.includes(event.team?.id || ''));
    }

    return events;
  }, [events, team, organization]);

  useEffect(() => {
    if ((!teams.length && !organizations.length) || team || organization) return;

    isMountedRef.current = true;

    const teamIdParam = searchParams.get('teamId');
    const organizationIdParam = searchParams.get('organizationId');
    if (!teamIdParam && !organizationIdParam) return;

    const searchTeam = teams.find(({ id }) => id === teamIdParam);
    if (searchTeam) {
      form.setValue('team', searchTeam);
      setIsFilterVisible(true);
      return;
    }

    const searchOrganization = organizations.find(({ id }) => id === organizationIdParam);
    if (searchOrganization) {
      form.setValue('organization', searchOrganization);
      setIsFilterVisible(true);
      return;
    }
  }, [teams.length, organizations.length]);

  useEffect(() => {
    calendarRef.current?.getApi().changeView(view, date);
  }, [view, date]);

  useEffect(() => {
    if (!isMountedRef.current) return;

    const params = new URLSearchParams();
    const dateString = getFullDate(date);

    params.set('date', dateString);
    params.set('view', views[view]);
    if (typeof team !== 'undefined') {
      if (team?.id) params.set('teamId', team?.id);
      else params.delete('teamId');
    }

    if (typeof organization !== 'undefined') {
      if (organization?.id) params.set('organizationId', organization?.id);
      else params.delete('organizationId');
    }

    replace(`${pathname}?${params.toString()}`);
  }, [view, date, team, organization]);

  useEffect(() => {
    if (!organization || team?.organizationId === organization.id) return;

    form.setValue('team', null);
  }, [organization]);

  const teamsOptions = useMemo(() => {
    if (!organization?.id) return teams;

    return teams.filter(team => team.organization.id === organization.id);
  }, [teams, organization?.id]);

  const loadingText = useMemo(() => {
    if (isLoadingUpcoming) return 'Loading upcoming events...';
    if (isLoadingPast) return 'Loading past events...';
    return null;
  }, [isLoadingPast, isLoadingUpcoming]);

  const schedulerData = useMemo(() => {
    return filteredEvents.map(event => {
      const color = getColor(event.teamId || event.owner?.id);
      const textColor = getContrastColor(color);
      return {
        extendedProps: { isCancelled: event.isCancelled },
        title: event.title,
        id: event.id,
        start: new Date(event.startsAt),
        end: new Date(event.endsAt),
        backgroundColor: color,
        borderColor: color,
        textColor: textColor,
      };
    });
  }, [filteredEvents]);

  const handleTodayClick = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.today();
    form.setValue('date', api.getDate());
  };

  const handlePrevClick = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.prev();
    form.setValue('date', api.getDate());
  };

  const handleNextClick = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.next();
    form.setValue('date', api.getDate());
  };

  const handleFilterClick = () => {
    setIsFilterVisible(prevState => !prevState);
  };

  const handleResetFiltersClick = () => {
    form.setValue('team', null);
    form.setValue('organization', null);
  };

  const handleDayClick = ({ date }: DateClickArg) => {
    form.setValue('date', date);
    form.setValue('view', CalendarView.DAY);
  };

  const handleMoreClick = ({ date }: MoreLinkArg) => {
    form.setValue('date', date);
    form.setValue('view', CalendarView.DAY);
  };

  const handleEventClick = (args: EventClickArg) => {
    const event = filteredEvents.find(({ id }) => id === args.event.id) || null;
    if (!event) return;

    setPreviewingEvent({ color: args.event.backgroundColor, ...event });
  };

  const handleViewItemClick = ({ currentTarget }: MouseEvent<HTMLElement>) => {
    form.setValue('view', currentTarget.id as CalendarView);
  };

  const handleClosePreviewEventModal = () => {
    setPreviewingEvent(null);
  };

  return (
    <>
      <Paper className={styles.calendar}>
        <CalendarToolbarComponent
          date={date}
          loadingText={loadingText}
          onFilterClick={handleFilterClick}
          onResetFiltersClick={handleResetFiltersClick}
          control={form.control}
          isTeamsLoading={isTeamsLoading}
          teams={teamsOptions}
          organizations={organizations}
          isOrganizationsLoading={isOrganizationsLoading}
          isFilterVisible={isFilterVisible || !!team}>
          <IconButtonComponent color="inherit" tooltipTitle={`Previous ${views[view]}`} onClick={handlePrevClick}>
            <NavigateBefore />
          </IconButtonComponent>
          <IconButtonComponent color="inherit" tooltipTitle={`Next ${views[view]}`} onClick={handleNextClick}>
            <NavigateNext />
          </IconButtonComponent>

          <Divider className={styles.calendarHeaderControlsDivider} orientation="vertical" />

          <Tooltip title={`Navigate to the current ${views[view]}`}>
            <Button variant="text" color="inherit" size="small" onClick={handleTodayClick}>
              Today
            </Button>
          </Tooltip>

          <Divider className={styles.calendarHeaderControlsDivider} orientation="vertical" />

          <Controller
            name="view"
            control={form.control}
            render={({ field }) => (
              <MenuComponent text={views[field.value]} tooltipTitle="Calendar view">
                {viewsOptions.map(key => (
                  <MenuItem key={key} id={key} onClick={handleViewItemClick} selected={key === field.value}>
                    {views[key]}
                  </MenuItem>
                ))}
              </MenuComponent>
            )}
          />

          <Divider className={styles.calendarHeaderControlsDivider} orientation="vertical" />
        </CalendarToolbarComponent>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={CalendarView.MONTH}
          eventTimeFormat={eventTimeFormat}
          views={calendarViews}
          fixedWeekCount={false}
          allDaySlot={false}
          headerToolbar={false}
          initialDate={date}
          dayMaxEvents
          nowIndicator
          events={schedulerData}
          moreLinkClick={handleMoreClick}
          dateClick={handleDayClick}
          eventClick={handleEventClick}
        />
      </Paper>

      <CalendarEventDetailsModalComponent
        {...previewingEvent!}
        isOpen={!!previewingEvent}
        onClose={handleClosePreviewEventModal}
      />
    </>
  );
};
