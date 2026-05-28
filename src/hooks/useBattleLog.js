import { useState, useRef, useCallback, useEffect } from 'react';

export function useBattleLog() {
  const [displayText, setDisplayText] = useState('');
  const [waiting, setWaiting] = useState(false);

  const msgQueueRef = useRef([]);
  const currentMsgRef = useRef('');
  const isTypingRef = useRef(false);
  const waitingForInputRef = useRef(false);
  const intervalRef = useRef(null);

  const startNextMessage = useCallback(() => {
    if (msgQueueRef.current.length === 0) {
      setDisplayText('');
      return;
    }
    const msg = msgQueueRef.current.shift();
    currentMsgRef.current = msg;
    let idx = 0;
    isTypingRef.current = true;
    waitingForInputRef.current = false;
    setWaiting(false);
    setDisplayText('');

    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayText(msg.slice(0, idx));
      if (idx >= msg.length) {
        clearInterval(intervalRef.current);
        isTypingRef.current = false;
        waitingForInputRef.current = true;
        setWaiting(true);
      }
    }, 50);
  }, []);

  const addLog = useCallback(
    (msg) => {
      msgQueueRef.current.push(msg);
      if (!isTypingRef.current && !waitingForInputRef.current) {
        startNextMessage();
      }
    },
    [startNextMessage],
  );

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const advance = useCallback(() => {
    if (isTypingRef.current) {
      clearInterval(intervalRef.current);
      isTypingRef.current = false;
      setDisplayText(currentMsgRef.current);
      waitingForInputRef.current = true;
      setWaiting(true);
    } else if (waitingForInputRef.current) {
      waitingForInputRef.current = false;
      setWaiting(false);
      startNextMessage();
    }
  }, [startNextMessage]);

  return { displayText, waiting, addLog, advance };
}
