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
    editScore?: number
    editReason?:string
    testResultDetails?: string
    temporaryToken: string
    temporaryTokenExpiresAt: string
    photo?: string
}

export type ApplicantShortDto = {
    id: string
    name: string
    surname: string
    patronymic?: string
    email: string
    preview?: string
    photo?: string
    status: string
    score?: number
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
    items: ApplicantShortDto[]
    totalCount: number
    currentPage: number
    pageSize: number
}

export type HistoryChatMessage = {
    role: string;
    content: string;
}