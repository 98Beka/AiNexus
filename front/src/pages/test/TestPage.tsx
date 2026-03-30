import { ChatWindow } from '@/features/chat/ui/ChatWindow';
import { Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

export default function TestPage() {
const newSessionId = uuidv4();

  return (
    <Box>
      <ChatWindow sessionId={newSessionId} />
    </Box>
  );
}