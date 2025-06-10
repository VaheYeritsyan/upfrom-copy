import { useContext } from 'react';
import { EventActionsModalsContext } from '~Context/EventActionsModalsContext';

export const useEventActionsModalsContext = () => {
  const eventActionsModalsContext = useContext(EventActionsModalsContext);

  if (!eventActionsModalsContext) {
    throw new Error('useEventActionsModalsContext should be used only inside <EventActionsContext>');
  }

  return { ...eventActionsModalsContext };
};
