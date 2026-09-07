import axios from 'axios';
export const api=axios.create({baseURL:'/api',headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(config=>{const token=localStorage.getItem('forma_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401&&localStorage.getItem('forma_token')){localStorage.removeItem('forma_token');localStorage.removeItem('forma_user');window.dispatchEvent(new Event('forma:logout'));}return Promise.reject(e);});
export const messageFromError=e=>e.response?.data?.message||(!e.response?'Unable to connect to Forma AI.':'Something went wrong. Please try again.');
