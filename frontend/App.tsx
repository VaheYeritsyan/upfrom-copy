import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Application } from './src/Navigators/Application';
import { AuthContextProvider } from './src/Context/AuthContext';
import { GraphQLProvider } from './src/Config/GraphQLProvider';
import { CurrentUserContextProvider } from '~Context/CurrentUserContext';
import { EventActionsModalsContextProvider } from '~Context/EventActionsModalsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from '~utils/toastConfig';
import { ChatContextProvider } from '~Context/ChatContext';
import { BottomNavigationBadgesContextProvider } from '~Context/BottomNavigationBadgesContext';
import { Chat, OverlayProvider } from 'stream-chat-react-native';
import { chatTheme } from '~Components/ChatClient/theme/chatTheme';
import { StreamChat } from 'stream-chat';
import Config from 'react-native-config';
import { OrganizationsModalsContextProvider } from '~Context/OrganizationModalsContext';
// ! this polyfill is required for hermes to work with urql
// ! https://github.com/aws-amplify/amplify-js/issues/10764#issuecomment-1363140556
import 'core-js/full/symbol/async-iterator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '~Theme/Colors';

globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
LogBox.ignoreAllLogs();

const chatClient = StreamChat.getInstance(Config.STREAM_CHAT_API_KEY ?? '');

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.grey100} />
      <AuthContextProvider>
        <GraphQLProvider>
          <CurrentUserContextProvider>
            <EventActionsModalsContextProvider>
              <SafeAreaProvider>
                <OrganizationsModalsContextProvider>
                  <GestureHandlerRootView
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{ flex: 1 }}>
                    <OverlayProvider>
                      <Chat
                        style={chatTheme}
                        // There is an error in data types in stream-chat library, will update it after they will fix an issue
                        // @ts-ignore
                        client={chatClient}>
                        <ChatContextProvider>
                          <BottomNavigationBadgesContextProvider>
                            <Application />
                          </BottomNavigationBadgesContextProvider>

                          <Toast config={toastConfig} />
                        </ChatContextProvider>
                      </Chat>
                    </OverlayProvider>
                  </GestureHandlerRootView>
                </OrganizationsModalsContextProvider>
              </SafeAreaProvider>
            </EventActionsModalsContextProvider>
          </CurrentUserContextProvider>
        </GraphQLProvider>
      </AuthContextProvider>
    </>
  );
};

export default App;
