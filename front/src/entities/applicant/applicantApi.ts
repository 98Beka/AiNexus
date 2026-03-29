import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

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
}

export type CreateApplicantRequest = {
  name: string
  surname: string
  patronymic?: string
  email: string
  phone?: string
}

export type TestResultRequest = {
  score: number
  testResultDetails?: string
}

export const applicantApi = createApi({
  reducerPath: 'applicantApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/applicants/`,
  }),
  endpoints: (builder) => ({
    createApplicant: builder.mutation<ApplicantDto, CreateApplicantRequest>({
      query: (body) => ({
        url: 'submit',
        method: 'POST',
        body,
      }),
    }),
    getApplicants: builder.query<ApplicantDto[], void>({
      query: () => ({
        url: '',
        method: 'GET',
      }),
    }),
    getApplicant: builder.query<ApplicantDto, string>({
      query: (id) => ({
        url: id,
        method: 'GET',
      }),
    }),
    getApplicantByToken: builder.query<ApplicantDto, string>({
      query: (token) => ({
        url: `token/${token}`,
        method: 'GET',
      }),
    }),
    updateApplicantTest: builder.mutation<ApplicantDto, { id: string; body: TestResultRequest }>({
      query: ({ id, body }) => ({
        url: `${id}/test-result`,
        method: 'PUT',
        body,
      }),
    }),
  }),
})

export const {
  useCreateApplicantMutation,
  useGetApplicantsQuery,
  useGetApplicantQuery,
  useGetApplicantByTokenQuery,
  useUpdateApplicantTestMutation,
} = applicantApi
