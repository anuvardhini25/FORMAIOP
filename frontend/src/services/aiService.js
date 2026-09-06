import axios from 'axios';

const API_TIMEOUT = 30000;

const api = axios.create({
  baseURL: '/api',
  timeout: API_TIMEOUT,
});

export const extractFromText = async (formId, text) => {
  if (!formId || typeof formId !== 'string') {
    throw new Error('A valid form ID is required');
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Text is required for AI extraction');
  }

  try {
    const res = await api.post('/ai/extract', {
      formId,
      text,
    });

    if (!res.data || typeof res.data !== 'object') {
      throw new Error('Invalid response from AI extraction service');
    }

    if (!res.data.success) {
      throw new Error(
        res.data.message || 'AI extraction failed'
      );
    }

    return res.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'AI extraction timed out. Please try again or fill the form manually.'
      );
    }

    if (!error.response) {
      throw new Error(
        'Unable to connect to the AI service. Please try again.'
      );
    }

    throw error;
  }
};
