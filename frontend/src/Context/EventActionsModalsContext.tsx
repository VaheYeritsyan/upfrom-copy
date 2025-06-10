import React, { ReactNode, createContext, useState, Dispatch, SetStateAction } from 'react';

type EventMeta = {
  isAllTeamsEvent?: boolean;
  eventId: string;
};

interface IEventActionsModalsContext {
  respondingEventMeta: EventMeta | null;
  attendingEventMeta: EventMeta | null;
  notAttendingEventMeta: EventMeta | null;
  setRespondingEventMeta: Dispatch<SetStateAction<EventMeta | null>>;
  setAttendingEventMeta: Dispatch<SetStateAction<EventMeta | null>>;
  setNotAttendingEventMeta: Dispatch<SetStateAction<EventMeta | null>>;
}

export const EventActionsModalsContext = createContext<IEventActionsModalsContext | null>(null);

export const EventActionsModalsContextProvider = ({ children }: { children: ReactNode }) => {
  const [respondingEventMeta, setRespondingEventMeta] = useState<EventMeta | null>(null);
  const [attendingEventMeta, setAttendingEventMeta] = useState<EventMeta | null>(null);
  const [notAttendingEventMeta, setNotAttendingEventMeta] = useState<EventMeta | null>(null);

  const contextValue = {
    respondingEventMeta,
    attendingEventMeta,
    notAttendingEventMeta,
    setRespondingEventMeta,
    setAttendingEventMeta,
    setNotAttendingEventMeta,
  };

  return <EventActionsModalsContext.Provider value={contextValue}>{children}</EventActionsModalsContext.Provider>;
};
