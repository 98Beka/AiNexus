export type ApplicantDto = {
    id: string
    name: string
    surname: string
    patronymic?: string
    email: string
    phone?: string
    createdAt: string
    status: string
    score?: number
    testResultDetails?: string
    temporaryToken: string
    temporaryTokenExpiresAt: string
    photo?: string
}

export type CreateApplicantRequest = {
    name: string
    surname: string
    patronymic?: string
    email: string
    phone?: string
    photo?: string
}

export type TestResultRequest = {
    score: number
    testResultDetails?: string
}

export type GetApplicantsRequest = {
    pageNumber: number
    pageSize: number
}

export type GetApplicantsResponse = {
    items: ApplicantDto[]
    totalCount: number
    currentPage: number
    pageSize: number
}

export type HistoryChatMessage = {
    role: string;
    content: string;
}