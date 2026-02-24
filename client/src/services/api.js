import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5005';
const ML_BASE = import.meta.env.VITE_ML_URL ?? 'http://localhost:8000';

const apiClient = axios.create({
	baseURL: API_BASE,
	timeout: 10_000,
});

const mlClient = axios.create({
	baseURL: ML_BASE,
	timeout: 30_000, // ML analysis might take longer
});

const handleResponse = (response) => response;
const handleError = (error) => {
	const detail = error?.response?.data?.detail;
	if (detail && typeof detail === 'string') {
		error.message = detail;
	}
	if (error.code === 'ECONNABORTED') {
		error.message = 'Server is taking too long to respond. Please try again.';
	}
	if (error.message === 'Network Error') {
		error.message = 'Unable to reach the service. Is it running?';
	}
	return Promise.reject(error);
};

apiClient.interceptors.response.use(handleResponse, handleError);
mlClient.interceptors.response.use(handleResponse, handleError);

export const analyzeAssessment = async (payload) => {
	const { data } = await mlClient.post('/api/analyze', payload);
	return data;
};

export const getHealthStatus = async () => {
	const { data } = await mlClient.get('/api/health');
	return data;
};

export const loginWithGoogle = async (credential) => {
	const { data } = await apiClient.post('/api/auth/google', { credential });
	return data;
};

export default apiClient;
