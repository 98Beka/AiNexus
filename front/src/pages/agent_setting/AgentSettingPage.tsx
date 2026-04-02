import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function getIdealApplicantDescription(): Promise<string> {
    const response = await fetch(`${BASE_URL}/api/Agent/ideal-applicant-description`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Could not load description: ${response.status}`)
    }

    // backend returns plain string (JSON string)
    const text = await response.text()

    // If it is JSON quoted string, parse it to plain string
    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

async function setIdealApplicantDescription(description: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/Agent/ideal-applicant-description`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(description),
    })

    if (!response.ok) {
        throw new Error(`Could not save description: ${response.status}`)
    }
}

export function AgentSettingPage() {
    const [description, setDescription] = useState('')
    const [originalDescription, setOriginalDescription] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadDescription = async () => {
        setLoading(true)
        setError(null)

        try {
            const current = await getIdealApplicantDescription()
            setDescription(current)
            setOriginalDescription(current)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadDescription()
    }, [])

    const onSave = async () => {
        setSaving(true)
        setError(null)

        try {
            await setIdealApplicantDescription(description)
            setOriginalDescription(description)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось сохранить описание.')
        } finally {
            setSaving(false)
        }
    }

    const onReset = () => {
        setDescription(originalDescription)
        setError(null)
    }

    return (
        <Box sx={{ padding: 1, width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Настройки агента
            </Typography>

            <Typography sx={{ mb: 2 }}>
                Идеальное описание соискателя используется для автоматической оценки и подбора кандидата.
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography>Загрузка...</Typography>
                </Box>
            ) : (
                <>
                    <TextField
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        label="Идеальное описание соискателя"
                        multiline
                        rows={25}
                        fullWidth
                        variant="outlined"
                        sx={{
                            mb: 2,
                            '& .MuiInputBase-input': {
                                fontSize: '15px',
                                lineHeight: 1.4,
                            },
                        }}
                    />

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onSave}
                            disabled={saving || loading || description === originalDescription}
                        >
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button variant="outlined" onClick={onReset} disabled={saving || loading || description === originalDescription}>
                            Отменить
                        </Button>
                        <Button variant="text" onClick={loadDescription} disabled={loading || saving}>
                            Обновить
                        </Button>
                    </Stack>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                </>
            )}
        </Box>
    )
}
