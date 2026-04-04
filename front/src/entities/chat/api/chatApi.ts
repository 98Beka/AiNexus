const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchChatAccessToken(test_token: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/Chats/access_token/${test_token}`, {
        method: "GET",
        headers: {
            Accept: "text/plain",
        },
    });

    if (!res.ok) {
        throw new Error(`Chat API Error: ${res.status}`);
    }

    return res.text();
}