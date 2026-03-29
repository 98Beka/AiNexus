import { Outlet } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Header from './Header'
import {Sidebar} from "../../widgets/sidebar.tsx";

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <Sidebar/>
      <div style={{ width: '100%', display: 'flex-col' }}>
          <Header />
          <Container sx={{ py: 4, flex: 1 }}>
              <Outlet />
          </Container>
      </div>
    </Box>
  )
}
