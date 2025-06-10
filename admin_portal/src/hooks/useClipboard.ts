import { useState } from 'react';
import { useToast } from '~/hooks/useToast';

type CopiedValue = string | null;
type CopyFn = (text: string, message?: string) => Promise<boolean>;

export const useClipboard = (): [CopiedValue, CopyFn] => {
  const toast = useToast();
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text, message) => {
    if (!navigator?.clipboard) {
      toast.showError('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.showInfo(message || 'Copied to clipboard');
      return true;
    } catch (error) {
      setCopiedText(null);
      toast.showError('Something went wrong');
      console.error('Copy failed', error);
      return false;
    }
  };

  return [copiedText, copy];
};
