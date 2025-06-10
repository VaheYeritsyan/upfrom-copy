import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pages } from '~/constants/pages';
import { useAuthContext } from '~/contexts/authContext';
import { SessionLoadingComponent } from '~/components/Loading/SessionLoadingComponent';

const AuthCallbackPage = () => {
  const { push } = useRouter();

  const { logIn } = useAuthContext();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const callbackToken = searchParams.get('token');
    if (callbackToken) {
      logIn(callbackToken);
    } else {
      push(Pages.LOGIN);
    }
  }, [window.location.search]);

  return <SessionLoadingComponent />;
};

export default AuthCallbackPage;
