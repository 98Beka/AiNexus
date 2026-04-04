import { useEffect, useRef, useState } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { sendMessageStream } from '../model/chatThunks';

export const ChatInput = () => {
  const [text, setText] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const dispatch = useAppDispatch();
  const isStreaming = useAppSelector(state => state.chat.isStreaming);

  const handleSend = async () => {
    if (!text.trim() || isStreaming) return;
    if (!sessionStarted) {
      try {
        setSessionStarted(true);
      } catch (error) {
        console.error('Failed to start session:', error);
        return;
      }
    }
    dispatch(sendMessageStream({ message: text }));
    setText('');
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);
  
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        placeholder="Введите сообщение..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
        disabled={isStreaming}
        size="small"
        multiline
        maxRows={4}
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!text.trim() || isStreaming}
      >
        {isStreaming ? <CircularProgress size={24} /> : <SendIcon />}
      </IconButton>
    </Box>
  );
};