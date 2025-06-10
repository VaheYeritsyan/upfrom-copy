import { MouseEvent, useState } from 'react';

export const useEntityCardConfirmationActions = (
  removeAction: () => Promise<unknown>,
  restoreAction?: () => Promise<unknown>,
) => {
  const [isRestoreConfirmationModalVisible, setIsRestoreConfirmationModalVisible] = useState(false);
  const [isRemoveConfirmationModalVisible, setIsRemoveConfirmationModalVisible] = useState(false);

  const handleRestoreClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsRestoreConfirmationModalVisible(true);
  };

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsRemoveConfirmationModalVisible(true);
  };

  const handleRestoreModalClose = () => {
    setIsRestoreConfirmationModalVisible(false);
  };

  const handleRemoveModalClose = () => {
    setIsRemoveConfirmationModalVisible(false);
  };

  const handleConfirmRestoreActionClick = async () => {
    if (!restoreAction) return;

    await restoreAction();
    setIsRestoreConfirmationModalVisible(false);
  };

  const handleConfirmRemoveActionClick = async () => {
    await removeAction();
    setIsRemoveConfirmationModalVisible(false);
  };

  return {
    remove: {
      handleClick: handleRemoveClick,
      handleConfirmClick: handleConfirmRemoveActionClick,
      handleModalClose: handleRemoveModalClose,
      isModalVisible: isRemoveConfirmationModalVisible,
    },
    restore: {
      handleClick: handleRestoreClick,
      handleConfirmClick: handleConfirmRestoreActionClick,
      handleModalClose: handleRestoreModalClose,
      isModalVisible: isRestoreConfirmationModalVisible,
    },
  };
};
