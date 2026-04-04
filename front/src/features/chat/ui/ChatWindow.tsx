import { useEffect, useRef } from 'react';
import { Box, Typography, Avatar, useTheme, useMediaQuery } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { ChatInput } from '@/features/chat/ui/ChatInput';
import { useAppSelector } from '@/app/hooks';

type Props = {
  preview: string
}

export const ChatWindow = ({ preview }: Props) => {
  const { messages, error } = useAppSelector((state) => state.chat);
  const bottomRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const sidebarHeight = 48;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.content]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: isTablet ? `calc(90vh - ${sidebarHeight}px)` : '90vh',
        width: '100%',
        maxWidth: 1000, // Убрали 100% для мобилок, mx: 'auto' всё равно растянет на всю ширину с учетом padding
        mx: 'auto',
        overflow: 'hidden',
        px: isMobile ? 1 : 2,
        pb: 2, // Отступ снизу для красоты
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          pr: 0.5,
          gap: 2, // Увеличили расстояние между сообщениями
          // Кастомный красивый скроллбар
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.text.secondary,
          },
        }}
      >
        {/* Отступ сверху для первого сообщения */}
        <Box sx={{ mt: 1 }} />

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'row', // Всегда слева
                gap: 2,
                alignItems: 'flex-start',
                // Плавная анимация появления
                animation: 'fadeIn 0.4s ease-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Avatar
                src={
                  isUser
                    ? `data:image/png;base64,${preview}`
                    : '/chat_bot_girl.png'
                }
                sx={{
                  width: isMobile ? 32 : 38,
                  height: isMobile ? 32 : 38,
                  color: '#fff',
                  background: isUser
                    ? 'linear-gradient(135deg, #4F8CFF, #2F6BFF)'
                    : 'linear-gradient(135deg, #7C4DFF, #B388FF)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  mt: 0.5,
                }}
              >
                {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
              </Avatar>

              <Box
                sx={{
                  maxWidth: isMobile ? '88%' : '80%',
                  p: 1,
                  // Делаем красивые "пузыри" сообщений с прямым углом возле аватарки
                  borderRadius: '16px',
                  borderBottomLeftRadius: '4px',
                  // Визуально отличаем фон пользователя и бота
                  bgcolor: isUser ? 'action.hover' : 'background.paper',
                  border: isUser ? 'none' : `1px solid ${theme.palette.divider}`,
                  boxShadow: isUser ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <Typography
                  variant={isMobile ? 'body2' : 'body1'}
                  sx={{
                    whiteSpace: 'pre-wrap',
                    color: 'text.primary',
                    lineHeight: 1.3,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                  }}
                >
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography
              color="error"
              variant="caption"
              sx={{
                bgcolor: 'error.light',
                color: 'error.contrastText',
                px: 2,
                py: 0.5,
                borderRadius: 4,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>

      {/* Контейнер ввода */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`, // Отделяем поле ввода линией
        }}
      >
        <ChatInput />
      </Box>
    </Box>
  );
};