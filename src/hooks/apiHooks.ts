import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface ApiSubject {
  id: string;
  name: string;
}

export interface ApiTopic {
  id: string;
  name: string;
  subject_id: string;
}

export interface ApiSubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export interface ApiTest {
  id: string;
  name: string;
  subject: string;
  topics: string[];
  sub_topics?: string[];
  status: 'draft' | 'active' | 'live' | 'completed' | null;
  created_at: string;
  total_questions?: number;
  total_time?: number;
  total_marks?: number;
  questions?: ApiQuestion[];
  type?: string;
  difficulty?: string;
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
}

export interface ApiQuestion {
  id: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation: string;
  difficulty: string;
  test_id: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  media_url?: string;
}

export interface CreateTestPayload {
  name: string;
  type: string;
  subject: string; // subject UUID
  topics: string[]; // array of topic UUIDs
  sub_topics: string[]; // array of subtopic UUIDs
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: string | null;
}

export interface UpdateTestPayload {
  name?: string;
  questions?: string[];
  total_questions?: number;
  total_marks?: number;
  status?: string;
  type?: string;
  subject?: string;
  topics?: string[];
  sub_topics?: string[];
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: string;
  total_time?: number;
}

export interface ApiQuestionInput {
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string; // "option1", "option2", etc.
  explanation: string;
  difficulty: string;
  test_id: string; // test UUID
  subject: string; // subject UUID/name
  topic?: string;
  subtopic?: string;
  media_url?: string;
}

// 5 minutes stale time for static/metadata endpoints
const METADATA_STALE_TIME = 5 * 60 * 1000;

// 2 minutes stale time for dynamic tests dashboard data
const TESTS_STALE_TIME = 2 * 60 * 1000;

export const useSubjects = () => {
  return useQuery<ApiSubject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects');
      return response.data.data;
    },
    staleTime: METADATA_STALE_TIME,
  });
};

export const useTopics = (subjectId: string) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subjectId);
  return useQuery<ApiTopic[]>({
    queryKey: ['topics', subjectId],
    queryFn: async () => {
      const response = await apiClient.get(`/topics/subject/${subjectId}`);
      return response.data.data;
    },
    staleTime: METADATA_STALE_TIME,
    enabled: !!subjectId && isUuid,
  });
};

export const useSubTopics = (topicId: string) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(topicId);
  return useQuery<ApiSubTopic[]>({
    queryKey: ['sub-topics', topicId],
    queryFn: async () => {
      const response = await apiClient.get(`/sub-topics/topic/${topicId}`);
      return response.data.data;
    },
    staleTime: METADATA_STALE_TIME,
    enabled: !!topicId && isUuid,
  });
};

export const useMultiTopicsSubTopics = (topicIds: string[]) => {
  const validTopicIds = topicIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
  return useQuery<ApiSubTopic[]>({
    queryKey: ['sub-topics', 'multi', ...validTopicIds],
    queryFn: async () => {
      const promises = validTopicIds.map(topicId =>
        apiClient.get(`/sub-topics/topic/${topicId}`).then(res => res.data.data as ApiSubTopic[])
      );
      const results = await Promise.all(promises);
      const allSubTopics = results.flat();
      const uniqueSubTopics: ApiSubTopic[] = [];
      const seenIds = new Set<string>();
      for (const st of allSubTopics) {
        if (st && st.id && !seenIds.has(st.id)) {
          seenIds.add(st.id);
          uniqueSubTopics.push(st);
        }
      }
      return uniqueSubTopics;
    },
    staleTime: METADATA_STALE_TIME,
    enabled: validTopicIds.length > 0,
  });
};

export const useTests = () => {
  return useQuery<ApiTest[]>({
    queryKey: ['tests'],
    queryFn: async () => {
      const response = await apiClient.get('/tests');
      return response.data.data;
    },
    staleTime: TESTS_STALE_TIME,
  });
};

export const useGetTest = (id: string) => {
  return useQuery<ApiTest>({
    queryKey: ['test', id],
    queryFn: async () => {
      const response = await apiClient.get(`/tests/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateTest = () => {
  return useMutation({
    mutationFn: async (payload: CreateTestPayload) => {
      const response = await apiClient.post('/tests', payload);
      return response.data.data;
    },
  });
};

export const useUpdateTest = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTestPayload }) => {
      const response = await apiClient.put(`/tests/${id}`, payload);
      return response.data.data;
    },
  });
};

export const useBulkCreateQuestions = () => {
  return useMutation<ApiQuestion[], Error, ApiQuestionInput[]>({
    mutationFn: async (questions: ApiQuestionInput[]) => {
      const response = await apiClient.post('/questions/bulk', { questions });
      return response.data.data;
    },
  });
};

export const useFetchBulkQuestions = (questionIds: string[]) => {
  return useQuery<ApiQuestion[]>({
    queryKey: ['questions', 'bulk', ...questionIds],
    queryFn: async () => {
      const response = await apiClient.post('/questions/fetchBulk', { question_ids: questionIds });
      const data: ApiQuestion[] = response.data.data;
      // Return questions in the same order as the requested questionIds (ascending/creation order)
      const idOrder = new Map(questionIds.map((id, i) => [id, i]));
      return [...data].sort((a, b) => {
        const aIdx = idOrder.has(a.id) ? idOrder.get(a.id)! : Infinity;
        const bIdx = idOrder.has(b.id) ? idOrder.get(b.id)! : Infinity;
        return aIdx - bIdx;
      });
    },
    enabled: questionIds.length > 0,
  });
};

export const useDeleteTest = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/tests/${id}`);
      return response.data;
    },
  });
};
