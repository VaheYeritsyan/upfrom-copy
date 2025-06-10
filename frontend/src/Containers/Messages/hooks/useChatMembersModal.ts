import { useState } from 'react';

export const useChatMembersModal = () => {
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);

  return { isMembersModalVisible, setIsMembersModalVisible };
};
