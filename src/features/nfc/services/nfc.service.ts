import { api } from '@/shared/services/api';
import type { NfcTag, CreateNfcTagPayload, UpdateNfcTagPayload } from '@/shared/types';

export const nfcService = {
  list: () => api.get<NfcTag[]>('/nfc-tag'),
  checkExists: (code: string) => api.get<{ exists: boolean }>(`/nfc-tag/exists/${code}`),
  create: (payload: CreateNfcTagPayload) => api.post<NfcTag>('/nfc-tag', payload),
  update: (id: number, payload: UpdateNfcTagPayload) => api.patch<NfcTag>(`/nfc-tag/${id}`, payload),
  remove: (id: number) => api.delete<NfcTag>(`/nfc-tag/${id}`),
};
