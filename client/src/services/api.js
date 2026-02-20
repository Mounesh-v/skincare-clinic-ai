import axios from 'axios';

const apiClient = axios.create({
	baseURL: 'http://localhost:5005/api',
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
	const { data } = await apiClient.post('/api/analyze', payload);
	return data;
};

export const getHealthStatus = async () => {
	const { data } = await apiClient.get('/api/health');
	return data;
};

export const loginWithGoogle = async (credential) => {
	const { data } = await apiClient.post('/api/auth/google', { credential });
	return data;
};

export default apiClient;
