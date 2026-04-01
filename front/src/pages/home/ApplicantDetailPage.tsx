import { useParams } from 'react-router-dom'
import { Box, Typography, Alert, Card, Divider, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import { useGetApplicantQuery, useGetHistoryQuery } from '../../entities/applicant/applicantApi'

const DetailSection = ({
                           title,
                           children,
                       }: {
    title?: string
    children: React.ReactNode
}) => (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'background.paper' }}>
        {title && (
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                {title}
            </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {children}
        </Box>
    </Card>
)

const DetailRow = ({
                       label,
                       value,
                   }: {
    label: string
    value?: string | number | null
}) => (
    <Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <span>/</span>
            <Typography variant="body2" fontWeight={500}>
                {value ?? '—'}
            </Typography>
        </Box>
        <Divider sx={{ mt: 1 }} />
    </Box>
)

export default function ApplicantDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [tab, setTab] = useState(0)
    const { data: applicant, isLoading, isError } = useGetApplicantQuery(id ?? '', {
        skip: !id,
    })
    const { data: chatHistory } = useGetHistoryQuery(id ?? '', {
        skip: !id,
    })

    if (isLoading) return <Typography>Загрузка...</Typography>
    if (isError) return <Alert severity="error">Не удалось загрузить данные заявителя.</Alert>
    if (!applicant) return <Alert severity="info">Заявитель не найден.</Alert>

    return (
        <Box
            sx={{
                p:6,
                display: 'grid',
                width: '100%',
                gridTemplateColumns: { xs: '1fr', md: '360px 1fr' },
                gap: 5,
                alignItems: 'start',
            }}
        >
            {/* Левая колонка — инфо о заявителе */}
            <DetailSection>
                <Box
                    sx={{
                        mt: 1,
                        mb: 2,
                        mx: 'auto',
                        width: 150,
                        height: 150,
                        borderRadius: 2,
                        bgcolor: '#CFCFCF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {applicant.photo && (
                        <Box
                            component="img"
                            src={`data:image/png;base64,${applicant.photo}`}
                            alt="Фото заявителя"
                            sx={{ width: 150, height: 150, borderRadius: '8px', objectFit: 'cover' }}
                        />
                    )}
                </Box>

                <DetailRow label="Имя" value={applicant.name} />
                <DetailRow label="Фамилия" value={applicant.surname} />
                <DetailRow label="Email" value={applicant.email} />
                <DetailRow label="Телефон" value={applicant.phone} />
                <DetailRow label="Текущий статус" value={applicant.status} />
            </DetailSection>

            {/* Правая колонка — результат теста или история чата */}
            <Card
                sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    height: '100%',
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, newValue) => setTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}
                >
                    <Tab label="Результат теста" />
                    <Tab label="История чата" />
                </Tabs>

                {tab === 0 ? (
                    <>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Результат теста
                        </Typography>

                        <DetailRow label="Баллы" value={applicant.score} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    maxHeight: 600,
                                    borderRadius: 2,
                                    bgcolor: '#f5f5f5',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    overflowY: 'auto',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.7,
                                    color: 'text.primary',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    p: 1.5,
                                }}
                            >
                                {applicant.testResultDetails ?? '—'}
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box
                        sx={{
                            flexGrow: 1,
                            maxHeight: 600,
                            borderRadius: 2,
                            bgcolor: '#ffffff',
                            border: '1px solid',
                            borderColor: 'divider',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            p: 2,
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                bgcolor: '#f5f5f5',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: '#bdbdbd',
                                borderRadius: '3px',
                            },
                        }}
                    >
                        {chatHistory && chatHistory.length > 0 ? (
                            chatHistory.map((message, idx) =>
                                message.role === 'assistant' ? (
                                    <Box key={idx} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', alignItems: 'flex-end' }}>
                                        <SmartToyIcon sx={{ fontSize: 24, color: '#1976d2', flexShrink: 0 }} />
                                        <Box
                                            sx={{
                                                maxWidth: '75%',
                                                bgcolor: '#e8edf7',
                                                color: '#333',
                                                p: '10px 14px',
                                                borderRadius: '12px',
                                                borderTopLeftRadius: '4px',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {message.content}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box key={idx} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Box
                                            sx={{
                                                maxWidth: '75%',
                                                bgcolor: '#1976d2',
                                                color: '#ffffff',
                                                p: '10px 14px',
                                                borderRadius: '12px',
                                                borderTopRightRadius: '4px',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {message.content}
                                            </Typography>
                                        </Box>
                                        <PersonIcon sx={{ fontSize: 24, color: '#1976d2', flexShrink: 0 }} />
                                    </Box>
                                )
                            )
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                <Typography color="text.secondary">История чата пуста</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Card>
        </Box>
    )
}