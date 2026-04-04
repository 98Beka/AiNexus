import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../shared/api/baseApi'
import type {
  CreateApplicantRequest,
  GetApplicantsResponse,
  GetApplicantsRequest,
  HistoryChatMessage,
  ApplicantDto,
  ApplicantShortDto
} from './type';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const applicantApi = createApi({
  reducerPath: 'applicantApi',
  baseQuery: createBaseQuery({
    baseUrl: `${BASE_URL ?? 'http://localhost:5000'}/api/v1/`,
  }),
  endpoints: (builder) => ({
    createApplicant: builder.mutation<ApplicantDto, CreateApplicantRequest>({
      query: (body: CreateApplicantRequest) => ({
        url: 'applicants/submit',
        method: 'POST',
        body,
      }),
    }),
    getApplicants: builder.query<GetApplicantsResponse, GetApplicantsRequest>({
      query: (body) => ({
        url: 'applicants',
        method: 'POST',
        body,
      }),
    }),
    getApplicant: builder.query<ApplicantDto, string>({
      query: (id: string) => ({
        url: `applicants/${id}`,
        method: 'GET',
      }),
    }),
    getHistory: builder.query<HistoryChatMessage[], string>({
      query: (userId: string) => ({
        url: `applicants/history/${userId}`,
        method: 'GET',
      }),
    }),
    getApplicantByToken: builder.query<ApplicantDto, string>({
      query: (token: string) => ({
        url: `applicants/token/${token}`,
        method: 'GET',
      }),
    }),
    updateApplicantScore: builder.mutation<void, { applicantId: string; editScore: number; editReason: string }>({
      query: (body) => ({
        url: 'test/update-score',
        method: 'POST',
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
  useGetHistoryQuery,
    useUpdateApplicantScoreMutation,
} = applicantApi

export async function fetchMyInfo(access_token: string): Promise<ApplicantShortDto> {
    const res = await fetch(`${BASE_URL}/api/v1/applicants/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: "text/plain"
        },
    });

    if (!res.ok) {
        throw new Error(`Chat API Error: ${res.status}`);
    }

    return await res.json();
}