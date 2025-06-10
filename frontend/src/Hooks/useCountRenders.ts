import { useRef } from 'react';

export const useCountRenders = (label: string = '') => {
  const counter = useRef(0);
  counter.current++;
  console.log(`${label} rendered ${counter.current} times`);
};
