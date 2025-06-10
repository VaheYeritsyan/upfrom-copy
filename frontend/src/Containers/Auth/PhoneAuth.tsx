import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { colors } from '~Theme/Colors';
import { TextField } from '~Components/Field/TextField';
import { useForm } from 'react-hook-form';
import { Masks } from 'react-native-mask-input';
import Config from 'react-native-config';
import axios from 'axios';
import { TopSection } from './TopSection';
import { showAlert } from '~utils/toasts';
import { KeyboardView } from '~Components/KeyboardView';
import { MainLayout } from '~Components/MainLayout';
import { openTermsAndConditionsInWeb } from '~utils/links';
import { useAuthContext } from '~Hooks/useAuthContext';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';

export type FormValues = {
  phone: string;
};

export function PhoneAuth() {
  const [resendCountDown, setResendCountDown] = useState<number | false>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, setError } = useForm<FormValues>({});
  const { token } = useAuthContext();
  const { currentUser } = useCurrentUserContext();

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

  async function submit({ phone }: FormValues) {
    setIsLoading(true);
    await axios
      .get(`${Config.API_URL}/auth/link/authorize`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: currentUser?.id, phone: '+1' + phone },
      })
      .then(() => {
        setResendCountDown(30);
      })
      .catch(error => {
        if (error.response) {
          setError('phone', { message: error.response.data.message });
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
            disabled={isLoading || !!resendCountDown}
            text="Send"
            onPress={handleSubmit(submit)}
          />
        }>
        <TopSection activeStep="phoneNumber" />
        <View>
          <View style={styles.phoneField}>
            <TextField
              control={control}
              name="phone"
              keyboardType="numeric"
              label="Phone Number"
              rules={{ required: true }}
              mask={Masks.USA_PHONE}
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
