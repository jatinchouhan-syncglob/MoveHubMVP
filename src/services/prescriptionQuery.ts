import { useMutation } from '@tanstack/react-query';

export const fetchPrescriptionApi = async (uhid: string) => {
  const formData = new FormData();
  formData.append('uhid', uhid);

  const res = await fetch('http://13.204.123.149:8000/api/v1/prescription-build/kafka', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch prescription');
  }

  return json.data || json.prescriptionPayload;
};

export const useFetchPrescriptionMutation = () => {
  return useMutation({
    mutationFn: (uhid: string) => fetchPrescriptionApi(uhid),
  });
};
