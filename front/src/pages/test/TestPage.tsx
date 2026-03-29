import { Box } from '@mui/material'
import { FullPageChat } from 'flowise-embed-react'

export default function TestPage() {

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Box sx={{ width: '100%', maxWidth: 900, height: '100vh' }}>
        <FullPageChat
          chatflowid="7c37a6d5-efca-4a32-ad07-98f8a1cb4c65"
          apiHost="http://localhost:3000"
          chatId= "your-custom-chat-id"
        />
      </Box>
    </Box>
  )
}