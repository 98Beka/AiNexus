import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Header from './Header'
import {Sidebar} from "../../widgets/sidebar.tsx";

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <Sidebar/>
      <div style={{ width: '100%', display: 'flex-col' }}>
          <Header />
          <Box sx={{ p: 4, flex: 1 }}>
              <Outlet />
          </Box>
      </div>
    </Box>
  )
}
