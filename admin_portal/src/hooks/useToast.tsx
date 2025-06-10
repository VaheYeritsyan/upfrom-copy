import { Button, Fade } from '@mui/material';
import { useSnackbar, SnackbarAction, OptionsObject } from 'notistack';

const commonOptions: OptionsObject = {
  TransitionComponent: Fade,
  anchorOrigin: { horizontal: 'center', vertical: 'bottom' },
};

export const useToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showAlert = (message: string, action?: SnackbarAction) => {
    enqueueSnackbar(message, { variant: 'default', action, ...commonOptions });
  };

  const showInfo = (message: string, action?: SnackbarAction) => {
    enqueueSnackbar(message, { variant: 'info', action, ...commonOptions });
  };

  const showWarning = (message: string, action?: SnackbarAction) => {
    enqueueSnackbar(message, { variant: 'warning', action, ...commonOptions });
  };

  const showSuccess = (message: string) => {
    enqueueSnackbar(message, { variant: 'success', ...commonOptions });
  };

  const showError = (message: string, autoHideDuration = 5000) => {
    enqueueSnackbar(message, { variant: 'error', ...commonOptions, autoHideDuration });
  };

  const showErrorWithRetryAction = (message: string, onClick?: () => void) => {
    const key = crypto.randomUUID();

    const handleClick = () => {
      onClick?.();
      closeSnackbar(key);
    };

    enqueueSnackbar(message, {
      ...commonOptions,
      variant: 'error',
      key,
      action: (
        <Button size="small" variant="text" sx={{ color: 'common.white' }} onClick={handleClick}>
          Retry
        </Button>
      ),
    });
  };

  return { showAlert, showInfo, showWarning, showSuccess, showError, showErrorWithRetryAction };
};
