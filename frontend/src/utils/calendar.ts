import { Linking, Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { Event } from '@up-from/graphql/genql';
import { getIsoDateString } from '~utils/dateFormat';
import { getMergedText } from '~utils/textFormat';
import { showAlert } from '~utils/toasts';
import { colors } from '~Theme/Colors';
import { GQLLocationType } from '~types/location';

type EventOptions = Pick<Event, 'title' | 'description' | 'startsAt' | 'endsAt' | 'address'> & {
  id?: string;
  location?: GQLLocationType | null;
};

const CALENDAR_SOURCE = 'UpFrom';
const FIVE_MINUTES = 1000 * 60 * 5;
const IS_IOS = Platform.OS === 'ios';

const getAppCalendar = async (source = CALENDAR_SOURCE) => {
  const calendars = await RNCalendarEvents.findCalendars();

  return calendars.find(calendar => calendar.title === source) || null;
};

const getAppCalendarId = async () => {
  const calendar = await getAppCalendar();
  if (calendar) return calendar.id;

  return RNCalendarEvents.saveCalendar({
    name: CALENDAR_SOURCE,
    title: CALENDAR_SOURCE,
    entityType: 'event',
    color: colors.primaryMain,
    accessLevel: 'owner',
    ownerAccount: CALENDAR_SOURCE,
    source: {
      name: 'Default',
      isLocalAccount: true,
    },
  });
};

const getEvent = async (calendarId: string, startDate: string, endDate: string, title: string) => {
  const start = getIsoDateString(new Date(startDate).getTime() - FIVE_MINUTES);
  const end = getIsoDateString(new Date(startDate).getTime() + FIVE_MINUTES);

  const events = await RNCalendarEvents.fetchAllEvents(start, end, [calendarId]);
  return events.find(event => event.title === title) || null;
};

const getIosCalendarAppLink = (startDate: string) => {
  // IOS timestamp since reference date (Jan 2001)
  const timestamp = 978300000000;
  const timeDiff = (new Date(startDate).getTime() - timestamp) / 1000;

  return `calshow:${timeDiff}`;
};

const getAndroidCalendarAppLink = (id: string) => {
  return `content://com.android.calendar/events/${id}`;
};

const getCalendarAppLink = (startDate: string, id: string) => {
  return IS_IOS ? getIosCalendarAppLink(startDate) : getAndroidCalendarAppLink(id);
};

const openCalendarApp = async (startDate: string, id: string) => {
  try {
    const calendarLink = getCalendarAppLink(startDate, id);
    await Linking.canOpenURL(calendarLink);
    await Linking.openURL(calendarLink);
  } catch (error) {
    console.log('opening calendar app error: ', error);
  }
};

const saveEvent = async (
  calendarId: string,
  startDate: string,
  endDate: string,
  { id, description, location, address, title }: Omit<EventOptions, 'startsAt' | 'endsAt'>,
) => {
  const eventId = await RNCalendarEvents.saveEvent(title, {
    id,
    notes: description,
    calendarId,
    endDate,
    alarms: [{ date: 60 * (IS_IOS ? -1 : 1) }, { date: 60 * 24 * (IS_IOS ? -1 : 1) }],
    startDate,
    location: getMergedText([location!.locationName, address!]),
  });

  return { id: eventId, startDate };
};

const saveOrUpdateEvent = async ({ endsAt, startsAt, ...options }: EventOptions) => {
  const calendarId = await getAppCalendarId();

  const startDate = getIsoDateString(startsAt);
  const endDate = getIsoDateString(endsAt);

  const event = await getEvent(calendarId, startDate, endDate, options.title);
  return saveEvent(calendarId, startDate, endDate, { ...options, id: event?.id });
};

const getPermissionsStatus = async () => {
  const status = await RNCalendarEvents.checkPermissions(false);
  if (status === 'authorized') return status;

  return RNCalendarEvents.requestPermissions(false);
};

export const saveEventToAppCalendar = async (options: EventOptions) => {
  const status = await getPermissionsStatus();
  if (status !== 'authorized') {
    showAlert('Calendar permissions were not granted');
    return null;
  }

  const event = await saveOrUpdateEvent(options);
  await openCalendarApp(event.startDate, event.id);

  return event.id;
};

export const updateEventInAppCalendar = async (
  oldEventOptions: Pick<EventOptions, 'startsAt' | 'endsAt' | 'title'>,
  { endsAt, startsAt, ...options }: EventOptions,
) => {
  const status = await getPermissionsStatus();
  if (status !== 'authorized') {
    showAlert('Calendar permissions were not granted');
    return null;
  }

  const calendarId = await getAppCalendarId();

  const oldStartDate = getIsoDateString(oldEventOptions.startsAt);
  const oldSndDate = getIsoDateString(oldEventOptions.endsAt);
  const startDate = getIsoDateString(startsAt);
  const endDate = getIsoDateString(endsAt);

  const event = await getEvent(calendarId, oldStartDate, oldSndDate, oldEventOptions.title);
  if (!event) return null;

  return saveEvent(calendarId, startDate, endDate, { ...options, id: event.id });
};

export const removeEventFromAppCalendar = async ({
  startsAt,
  endsAt,
  title,
}: Pick<EventOptions, 'startsAt' | 'endsAt' | 'title'>) => {
  const status = await getPermissionsStatus();
  if (status !== 'authorized') {
    showAlert('Calendar permissions were not granted');
    return null;
  }

  const calendarId = await getAppCalendarId();

  const startDate = getIsoDateString(startsAt);
  const endDate = getIsoDateString(endsAt);

  const event = await getEvent(calendarId, startDate, endDate, title);
  if (!event) return null;

  return RNCalendarEvents.removeEvent(event.id);
};
