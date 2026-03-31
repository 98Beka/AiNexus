import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '@/entities/shared/api/baseApi';

export type DetectFaceRequest = {
    photo: string
    id: string
}

export type DetectFaceResponse = {
    same_person: boolean
    num_face_on_photo: number
    message: string
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: createBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
    }),
    endpoints: (builder) => ({
        detectFace: builder.mutation<DetectFaceResponse,DetectFaceRequest >({
            query: (body: DetectFaceRequest) => ({
                url: '/api/v1/proctoring/comparison-face/',
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