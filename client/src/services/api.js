import axios from 'axios';

const rawHost = import.meta.env.VITE_APP_HOST ?? import.meta.env.HOST ?? '127.0.0.1';
const FALLBACK_HOST = `${rawHost}`.trim() || '127.0.0.1';
const rawPort = import.meta.env.VITE_APP_PORT ?? import.meta.env.PORT ?? '5174';
const FALLBACK_PORT = `${rawPort}`.trim() || '5174';

const resolveDefaultBaseUrl = () => {
	if (typeof window !== 'undefined' && window.location?.origin) {
		return window.location.origin;
	}
	return `http://${FALLBACK_HOST}:${FALLBACK_PORT}`;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || resolveDefaultBaseUrl();

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10_000,
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		const detail = error?.response?.data?.detail;
		if (detail && typeof detail === 'string') {
			error.message = detail;
		}
		if (error.code === 'ECONNABORTED') {
			error.message = 'Server is taking too long to respond. Please try again.';
		}
		if (error.message === 'Network Error') {
			error.message = 'Unable to reach the analysis service. Is it running?';
		}
		return Promise.reject(error);
	}
);

export const analyzeAssessment = async (payload) => {
	const { data } = await apiClient.post('/analyze', payload);
	return data;
};

export const getHealthStatus = async () => {
	const { data } = await apiClient.get('/health');
	return data;
};

export const loginWithGoogle = async (credential) => {
	const { data } = await apiClient.post('/auth/google', { credential });
	return data;
};

export default apiClient;
