export async function fetchChatAccessToken(
    test_token: string,
): Promise<string> {

    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/Chats/access_token/${test_token}`,
        {
            method: 'GET',
            headers: {
                accept: '*/*',
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Chat API Error: ${response.status}`);
    }

    return await response.text();
}