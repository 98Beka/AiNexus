import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '@/entities/shared/api/baseApi';

export type LoginRequest = { email: string; password: string }

export type AuthenticateResponse = {
    id: string
    accessToken: string
    refreshToken: string
    surname: string
    name: string
    patronymic?: string
    email: string
    role: string
}

export type MyAccountInfo = {
    id: string
    surname: string
    name: string
    patronymic?: string
    email: string
    role: string
}

export type ComparisonFacesRequest = {
    original_photo: string
    photo: string
    fullname: string
    pin: string
}

export type ComparisonFacesResponse = {
    same_person: boolean
    num_faces_on_photo: number
    message: string
}

export type DetectFaceRequest = {
    photo: string
}

export type DetectFaceResponse = boolean

export const api = createApi({
    reducerPath: 'api',
    baseQuery: createBaseQuery({
        baseUrl: import.meta.env.VITE_API_SECONDARY_URL ?? 'http://localhost:5000',
    }),
    endpoints: (builder) => ({
        comparisonFaces: builder.mutation<
            ComparisonFacesResponse,
            ComparisonFacesRequest
        >({
            query: (body: ComparisonFacesRequest) => ({
                url: '/api/v1/comparison-faces/',
                method: 'POST',
                body,
            }),
        }),
        detectFace: builder.mutation<
            DetectFaceResponse,
            DetectFaceRequest
        >({
            query: (body: DetectFaceRequest) => ({
                url: '/api/v1/detect-face/',
                method: 'POST',
                body,
            }),
        }),

    }),
})

export const {
    useComparisonFacesMutation,
    useDetectFaceMutation,
} = api