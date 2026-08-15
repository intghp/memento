import axios from 'axios';

// Don't have to repeate the baseURL in every request, just use api.get('/tasks') instead of axios.get('http://localhost:8000/api/tasks')
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});