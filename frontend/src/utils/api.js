import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    return response.data.token;
};

export const scan = async (type, token) => {
    const response = await axios.post(
        `${API_URL}/scan`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};