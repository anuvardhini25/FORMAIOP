import {api} from './api';export const extractFromText=(formId,text)=>api.post('/ai/extract',{formId,text}).then(r=>r.data);
