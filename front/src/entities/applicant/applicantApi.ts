import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../shared/api/baseApi'
import type {
  CreateApplicantRequest,
  GetApplicantsResponse,
  GetApplicantsRequest,
  TestResultRequest,
  HistoryChatMessage,
  ApplicantDto
} from './type';

export const applicantApi = createApi({
  reducerPath: 'applicantApi',
  baseQuery: createBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/v1/applicants`,
  }),
  endpoints: (builder) => ({
    createApplicant: builder.mutation<ApplicantDto, CreateApplicantRequest>({
      query: (body: CreateApplicantRequest) => ({
        url: 'submit',
        method: 'POST',
        body,
      }),
    }),
    getApplicants: builder.query<GetApplicantsResponse, GetApplicantsRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
    }),
    getApplicant: builder.query<ApplicantDto, string>({
      query: (id: string) => ({
        url: id,
        method: 'GET',
      }),
    }),
    getHistory: builder.query<HistoryChatMessage[], string>({
      query: (userId: string) => ({
        url: `history/${userId}`,
        method: 'GET',
      }),
    }),
    getApplicantByToken: builder.query<ApplicantDto, string>({
      query: (token: string) => ({
        url: `token/${token}`,
        method: 'GET',
      }),
    }),
    updateApplicantTest: builder.mutation<ApplicantDto, { id: string; body: TestResultRequest }>({
      query: ({ id, body }: { id: string; body: TestResultRequest }) => ({
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
  useGetHistoryQuery
} = applicantApi
