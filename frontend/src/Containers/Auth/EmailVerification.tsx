import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { colors } from '~Theme/Colors';
import { TextField } from '~Components/Field/TextField';
import { useForm } from 'react-hook-form';
import Config from 'react-native-config';
import axios from 'axios';
import { TopSection } from './TopSection';
import { useAuthContext } from '~Hooks/useAuthContext';
import { showAlert } from '~utils/toasts';
import { MainLayout } from '~Components/MainLayout';
import { KeyboardView } from '~Components/KeyboardView';
import { openTermsAndConditionsInWeb } from '~utils/links';

export type FormValues = {
  email: string;
};

export function EmailVerification() {
  const [resendCountDown, setResendCountDown] = useState<number | false>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { invitation } = useAuthContext();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({});
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (resendCountDown) {
      const timerID = setInterval(() => {
        if (resendCountDown > 1) {
          setResendCountDown(resendCountDown - 1);
        } else {
          setResendCountDown(false);
        }
      }, 1000);
      return () => clearInterval(timerID);
    }
  }, [resendCountDown]);

  async function submit({ email }: FormValues) {
    setIsLoading(true);
    // TODO: Similar to urql middleware, add token to header for regular axios calls
    // TODO: additionally set root url
    console.log('email', email);
    await axios
      .get(`${Config.API_URL}/auth/link/authorize?teamId=${invitation?.teamId}&email=${encodeURIComponent(email)}`)
      .then(() => {
        setResendCountDown(30);
        console.log('Email sent');
      })
      .catch(error => {
        console.log('error', error);
        if (error.response) {
          console.log('error', error.response.data.message);
          setError('email', { message: error.response.data.message });
          showAlert(error.response.data.message);
        }
      });
    setIsLoading(false);
  }

  return (
    <KeyboardView>
      <MainLayout
        containerStyle={styles.container}
        style={styles.body}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        stickyBottomContent={
          <ContainedButton
            color="blueGradient"
            disabled={isLoading || !!resendCountDown || hasErrors}
            text="Send"
            onPress={handleSubmit(submit)}
          />
        }>
        <TopSection activeStep="email" />
        <View>
          <View style={styles.emailField}>
            <TextField
              control={control}
              name="email"
              keyboardType="email-address"
              label="E-mail Address"
              rules={{ required: true }}
              autoCapitalize="none"
            />
          </View>
          {resendCountDown && (
            <Typography variant="body2Medium" align="center" style={styles.resendText}>
              Didn't get the Link?&nbsp;
              <Typography variant="body2SemiBold">You can resend in {resendCountDown} sec</Typography>
            </Typography>
          )}
          <Typography style={styles.footerText} align="center" variant="body2Medium">
            By tapping the Send button, you automatically agree to our &nbsp;
            <Typography style={styles.linkText} variant="body2SemiBold" onPress={openTermsAndConditionsInWeb}>
              Terms and Conditions
            </Typography>
            Please take a moment to carefully read and understand them before proceeding.
          </Typography>
        </View>
      </MainLayout>
    </KeyboardView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 24,
    marginTop: 50,
    paddingBottom: 80,
    justifyContent: 'space-between',
  },
  resendText: {
    color: colors.grey400,
    marginBottom: 24,
  },
  emailField: {
    marginBottom: 24,
  },
  footerText: {
    marginBottom: 24,
    color: colors.grey400,
  },
  linkText: {
    color: colors.primaryMain,
  },
  phoneField: {
    marginBottom: 24,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
