import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';
// Android doesn't work with "Will" events but iOS works wrong with "Did" ones.
const showEventName = isIOS ? 'keyboardWillShow' : 'keyboardDidShow';
const hideEventName = isIOS ? 'keyboardWillHide' : 'keyboardDidHide';

export const useKeyboard = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const handleKeyBoardShow = () => {
    setKeyboardVisible(true);
  };

  const handleKeyBoardHide = () => {
    setKeyboardVisible(false);
  };

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(showEventName, handleKeyBoardShow);
    const keyboardHideListener = Keyboard.addListener(hideEventName, handleKeyBoardHide);

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  return { isKeyboardVisible };
};
