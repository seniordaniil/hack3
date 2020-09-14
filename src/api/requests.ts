import { instance } from './client';

export const upload = async (file: File) => {
  const formData = new FormData();
  formData.append('picture', file);

  const { data } = await instance.post('/pictures', formData, {
    headers: {
      'content-type': 'multipart/form-data',
    },
  });

  return process.env.REACT_APP_BASE_URL + data?.picture?.url;
};

interface CreateParams {
  type_of: string;
  name: string;
  sum: number;
  aim: string;
  picture: string;
  description: string;
  date_close: string;
  author?: string;
}

export interface FundResponse extends CreateParams {
  id: number;
  progress: number;
}

export const create = async (params: CreateParams) => {
  const { data } = await instance.post<FundResponse>('/donations', params);

  return data;
};

export const getDonate = async (id: number) => {
  const { data } = await instance.get<FundResponse>(`/donations/${id}`);
  return data;
};

export const donate = async (id: number, count: number) => {
  const { data } = await instance.post<FundResponse>(`/donations/donate`, {
    id,
    count,
  });
  return data.progress;
};
