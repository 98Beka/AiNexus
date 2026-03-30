import { ChatWindow } from '@/features/chat/ui/ChatWindow';
import { Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { setAccessToken, setSessionId } from '@/entities/session/model/slice';
import { useDispatch } from 'react-redux';
import { fetchChatAccessToken } from '@/features/test/api';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function TestPage() {
  const dispatch = useDispatch();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    const newSessionId = uuidv4();

    async function init() {
      const accessToken = await fetchChatAccessToken(token ?? "");
      dispatch(setAccessToken(accessToken));
      dispatch(setSessionId(newSessionId));
    }

    init();
  }, [token, dispatch]);

  return (
    <Box>
      <ChatWindow />
    </Box>
  );
}