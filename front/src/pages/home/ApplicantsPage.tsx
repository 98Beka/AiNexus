import {
  Alert,
  Box,
  CircularProgress,
  Typography,
 Avatar,
} from '@mui/material'
import { useState } from 'react'
import { useGetApplicantsQuery} from '../../entities/applicant/applicantApi'
import { Link } from 'react-router-dom'
import type { ApplicantDto } from '@/entities/applicant/type'


const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'АКТИВЕН',   color: '#15803d', bg: '#dcfce7' },
  INACTIVE: { label: 'НЕАКТИВЕН', color: '#92400e', bg: '#fef9c3' },
  OFFLINE:  { label: 'ОФЛАЙН',    color: '#be123c', bg: '#ffe4e6' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#374151', bg: '#f3f4f6' }
  return (
      <Box
          component="span"
          sx={{
            display: 'inline-block',
            py: 0.4,
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: cfg.color,
            backgroundColor: cfg.bg,
            border: `1.5px solid ${cfg.color}33`,
          }}
      >
        {cfg.label}
      </Box>
  )
}

function PageBtn({
                   children,
                   onClick,
                   disabled,
                 }: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
}) {
  return (
      <Box
          component="button"
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: disabled ? '#cbd5e1' : '#475569',
            fontSize: '1rem',
            cursor: disabled ? 'default' : 'pointer',
            transition: 'all 0.15s',
            '&:hover:not(:disabled)': { backgroundColor: '#f1f5f9', borderColor: '#94a3b8' },
          }}
      >
        {children}
      </Box>
  )
}
export default function ApplicantsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, isError } = useGetApplicantsQuery(
    { pageNumber: page, pageSize },
    { refetchOnFocus: true }
  )

  const applicants = data?.items ?? []

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )

  if (isError) {
    return <Alert severity="error">Ошибка при загрузке заявителей.</Alert>
  }
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 1

  return (
    <Box sx={{ px: 8 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Список заявителей
      </Typography>

      {/* Table Card */}
      <Box
          sx={{
            backgroundColor: '#fff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px 0 rgb(0 0 0 / 0.06)',
          }}
      >
        {/* Header */}
        <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 2fr 1.5fr 0.8fr 1fr',
              px: 3,
              py: 1.5,
              borderBottom: '1px solid #e2e8f0',
            }}
        >
          {['ФИО', 'EMAIL', 'СТАТУС', 'БАЛЛЫ', ''].map((h) => (
              <Typography
                  key={h}
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
              >
                {h}
              </Typography>
          ))}
        </Box>

        {/* Rows */}
        {applicants.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>Нет записей</Box>
        ) : (
            applicants.map((applicant: ApplicantDto) => (
                <Box
                    key={applicant.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 2fr 1.5fr 0.8fr 1fr',
                      px: 3,
                      py: 1.8,
                      borderBottom: '1px solid #f1f5f9',
                      alignItems: 'center',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { backgroundColor: '#f8fafc' },
                      transition: 'background 0.15s',
                    }}
                >
                  {/* Avatar + Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Avatar
                        src={
                          applicant.photo
                              ? `data:image/jpeg;base64,${applicant.photo}`
                              : undefined
                        }
                        sx={{ width: 40, height: 40, flexShrink: 0, border: '2px solid #e2e8f0' }}
                    >
                      {`${applicant.surname?.[0] ?? ''}${applicant.name?.[0] ?? ''}`}
                    </Avatar>
                    <Typography
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                    >
                      {applicant.surname} {applicant.name}
                    </Typography>
                  </Box>

                  {/* Email */}
                  <Typography
                      sx={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                  >
                    {applicant.email}
                  </Typography>

                  {/* Status */}
                  <Box>
                    <StatusBadge status={applicant.status} />
                  </Box>

                  {/* Score */}
                  <Typography sx={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                    {applicant.score ?? '—'}
                  </Typography>

                  {/* Action */}
                  <Box>
                    <Box
                        component={Link}
                        to={`/applicant/${applicant.id}`}
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#6366f1',
                          textDecoration: 'none',
                          px: 1.5,
                          py: 0.6,
                          borderRadius: '7px',
                          border: '1.5px solid #c7d2fe',
                          display: 'inline-block',
                          transition: 'all 0.15s',
                          '&:hover': { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
                        }}
                    >
                      Подробнее
                    </Box>
                  </Box>
                </Box>
            ))
        )}
      </Box>

      {/* Pagination */}
      {data && data.totalCount > pageSize && (
          <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
              }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
              Страница {page} из {totalPages}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
              <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</PageBtn>
              <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</PageBtn>
              <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
            </Box>
          </Box>
      )}
    </Box>
  )
}