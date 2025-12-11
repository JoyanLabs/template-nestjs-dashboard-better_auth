import { check } from 'k6';
import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
	stages: [
		{ duration: '5s', target: 5 },
		{ duration: '10s', target: 20 },
		{ duration: '5s', target: 0 },
	],
	thresholds: {
		http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
	},
};

export default function () {
	const res = http.get(`${BASE_URL}/health`);
	check(res, {
		'Health check status is 200': (r) => r.status === 200,
	});
}
