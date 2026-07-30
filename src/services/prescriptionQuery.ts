import { useMutation } from '@tanstack/react-query';

export const fetchPrescriptionApi = async (uhid: string) => {
  const formData = new FormData();
  formData.append('uhid', uhid);

  console.log(
    '[prescriptionQuery] Fetching URL: http://13.204.123.149:8000/health/api/prescription-build',
  );
  const res = await fetch(
    'http://13.204.123.149:8000/health/api/prescription-build',
    {
      method: 'POST',
      body: formData,
    },
  );

  console.log(
    `[prescriptionQuery] HTTP Status Code: ${res.status} ${res.statusText}`,
  );

  let responseText = '';
  try {
    responseText = await res.text();
  } catch (textErr) {
    console.error(
      '[prescriptionQuery] Failed to read response body text:',
      textErr,
    );
  }

  if (!res.ok) {
    console.error(
      `[prescriptionQuery] HTTP Error Response Body: ${responseText}`,
    );
    throw new Error(
      `Server returned HTTP ${res.status}: ${responseText.slice(0, 150)}`,
    );
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    console.error(
      `[prescriptionQuery] Expected JSON response but received Content-Type "${contentType}". Response Body: ${responseText}`,
    );
    throw new Error(
      `Expected JSON response but got content-type "${contentType}".`,
    );
  }

  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch (parseErr) {
    console.error(
      `[prescriptionQuery] JSON parsing error. Raw response text: ${responseText} ${parseErr}`,
    );
    throw new Error('Failed to parse prescription response as JSON.');
  }

  if (json.status !== 'success') {
    console.error('[prescriptionQuery] API returned success=false:', json);
    throw new Error(json.message || 'Failed to fetch prescription');
  }

  return json.data || json.prescriptionPayload;
};

export const useFetchPrescriptionMutation = () => {
  return useMutation({
    mutationFn: (uhid: string) => fetchPrescriptionApi(uhid),
  });
};
