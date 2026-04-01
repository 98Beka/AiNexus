import { useParams } from 'react-router-dom'
import { Box, Typography, Alert, Card, Divider } from '@mui/material'
import { useGetApplicantQuery } from '../../entities/applicant/applicantApi'

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
    const { data: applicant, isLoading, isError } = useGetApplicantQuery(id ?? '', {
        skip: !id,
    })

    if (isLoading) return <Typography>Загрузка...</Typography>
    if (isError) return <Alert severity="error">Не удалось загрузить данные заявителя.</Alert>
    if (!applicant) return <Alert severity="info">Заявитель не найден.</Alert>

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '360px 1fr' },
                gap: 5,
                p: 2,
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
                        width: 180,
                        height: 220,
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
                            sx={{ width: 150, height: 200, borderRadius: '8px', objectFit: 'cover' }}
                        />
                    )}
                </Box>

                <DetailRow label="Имя" value={applicant.name} />
                <DetailRow label="Фамилия" value={applicant.surname} />
                <DetailRow label="Email" value={applicant.email} />
                <DetailRow label="Телефон" value={applicant.phone} />
                <DetailRow label="Текущий статус" value={applicant.status} />
            </DetailSection>

            {/* Правая колонка — результат теста */}
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
                <Typography variant="subtitle1" fontWeight={600}>
                    Результат теста
                </Typography>

                <DetailRow label="Баллы" value={applicant.score} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Детали результата
                    </Typography>
                    <Box
                        sx={{
                            flexGrow: 1,
                            maxHeight: 700,
                            p: 2,
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
                        }}
                    >
                        {applicant.testResultDetails ?? '—'}
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}