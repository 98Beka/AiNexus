import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, CircularProgress, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
// Если используете react-router-dom для получения test_token из URL:
// import { useParams } from 'react-router-dom'; 

import { useGetAccessTokenQuery } from '@/entities/chat/api/chatApi';
import { useChatStream } from '@/features/chat/lib/useChatStream';

export default function TestPage() {
  // Mock: В реальности получаем из URL, например через useParams().testToken
  const testToken = "dummy-test-token-from-url"; 

  // 1. Получаем JWT через RTK Query
  const { data: jwtToken, isLoading: isAuthLoading, isError } = useGetAccessTokenQuery(testToken, {
    skip: !testToken
  });

  // 2. Инициализируем логику чата
  const { messages, currentStream, isStreaming, startTest, sendMessage } = useChatStream(jwtToken);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  const handleSend = () => {
    if (inputValue.trim() && !isStreaming) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  if (isAuthLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (isError || !jwtToken) {
    return <Typography color="error" p={4}>Ошибка авторизации. Неверный или просроченный токен.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', mx: 'auto', p: 2 }}>
      
      {/* Шапка */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Тестирование AI</Typography>
        <Button 
          variant="contained" 
          onClick={startTest} 
          disabled={isStreaming || messages.length > 0}
        >
          Начать тест
        </Button>
      </Box>

      {/* Окно чата */}
      <Paper sx={{ flex: 1, overflowY: 'auto', p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.length === 0 && !currentStream && (
          <Typography color="text.secondary" align="center" sx={{ mt: 'auto', mb: 'auto' }}>
            Нажмите "Начать тест", чтобы инициировать сессию.
          </Typography>
        )}

        {messages.map((msg) => (
          <Box 
            key={msg.id} 
            sx={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? 'primary.main' : 'grey.200',
              color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
              p: 1.5,
              borderRadius: 2,
              maxWidth: '80%'
            }}
          >
            <Typography variant="body1">{msg.content}</Typography>
          </Box>
        ))}

        {/* Анимация печати (Streaming) */}
        {currentStream && (
          <Box sx={{ alignSelf: 'flex-start', backgroundColor: 'grey.200', p: 1.5, borderRadius: 2, maxWidth: '80%' }}>
            <Typography variant="body1">
              {currentStream}
              <span className="cursor-blink">|</span>
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Поле ввода */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Введите сообщение..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isStreaming}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          disabled={!inputValue.trim() || isStreaming}
          sx={{ bgcolor: 'primary.light', borderRadius: 2, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
        >
          {isStreaming ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>

      {/* Мигающий курсор для эффекта печати AI */}
      <style>
        {`
          .cursor-blink {
            animation: blink 1s step-start infinite;
          }
          @keyframes blink {
            50% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
}