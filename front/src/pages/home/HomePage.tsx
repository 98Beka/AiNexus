// src/pages/HomePage.tsx
import { Alert, Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'
import { useGetApplicantsQuery, type ApplicantDto } from '../../entities/applicant/applicantApi'
import { Link } from 'react-router-dom'

export default function HomePage() {
/*  const { data: myAccount, isLoading: accountLoading, isFetching: accountFetching, error: accountError } = useGetMyAccountQuery(undefined, {
    refetchOnFocus: true,
  })

  const { data: applicants, isLoading: applicantsLoading, isError: applicantsError } = useGetApplicantsQuery(undefined, {
    refetchOnFocus: true,
  })*/

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
        AiNexus
    </Box>
  )
}