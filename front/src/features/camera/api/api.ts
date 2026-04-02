export const detectFace = async (photo: string, access_token: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/proctoring/comparison_faces`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ photo }),
    }
  );

  if (!res.ok) throw new Error('Failed to detect face');
  return res.json();
};