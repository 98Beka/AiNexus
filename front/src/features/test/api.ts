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

export async function initializeTest(access_token: string, sessionId: string) {
    const res = await fetch(`${BASE_URL}/api/v1/test/initialize`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            chatSessionId: sessionId,
        }),
    });

    if (!res.ok) {
        throw new Error(`Initialize Error: ${res.status}`);
    }

    return res.json();
}

export async function finishTest(access_token: string) {
    const res = await fetch(`${BASE_URL}/api/v1/test/finish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: "*/*",
        },
    });

    if (!res.ok) {
        throw new Error(`Finish Error: ${res.status}`);
    }

    return res;
}