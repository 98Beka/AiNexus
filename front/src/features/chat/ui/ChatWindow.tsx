import { useEffect, useRef } from 'react';
import { Box, Typography, Avatar, useTheme, useMediaQuery } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { ChatInput } from '@/features/chat/ui/ChatInput';
import { useAppSelector } from '@/app/hooks';

type Props = {
  sessionId: string;
};

export const ChatWindow = ({ sessionId }: Props) => {
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
        height: isTablet
          ? `calc(90vh - ${sidebarHeight}px)`
          : '90vh',
        width: '100%',
        maxWidth: isMobile ? '100%' : 800,
        mx: 'auto',
        overflow: 'hidden',
        px: isMobile ? 1 : 2
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          pr: isMobile ? 1 : 2,
          gap: isMobile ? 1.5 : 2
        }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <Box
              key={index}
              sx={{
                mt: isUser ? 2 : 1,
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                gap: isMobile ? 1 : 1.5,
                alignItems: 'flex-start'
              }}
            >
              <Avatar
                sx={{
                  width: isMobile ? 24 : 28,
                  height: isMobile ? 24 : 28
                }}
              >
                {isUser
                  ? <PersonIcon fontSize="small" />
                  : <SmartToyIcon fontSize="small" />}
              </Avatar>

              <Box
                sx={{
                  maxWidth: isMobile ? '85%' : '75%',
                  color: 'text.primary'
                }}
              >
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {error && (
          <Typography color="error" align="center" variant="caption">
            {error}
          </Typography>
        )}

        <div ref={bottomRef} />
      </Box>

      <Box sx={{ mt: isMobile ? 1 : 2 }}>
        <ChatInput sessionId={sessionId} />
      </Box>
    </Box>
  );
};