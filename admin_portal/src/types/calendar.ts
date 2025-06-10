export enum CalendarView {
  MONTH = 'dayGridMonth',
  WEEK = 'timeGridWeek',
  DAY = 'timeGridDay',
}

export type CalendarQueryParams = {
  date: string;
  view: string;
  teamId?: string;
};
