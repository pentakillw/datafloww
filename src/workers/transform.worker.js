import { applyBatchTransform } from '../utils/transformEngine.js';

self.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === 'PROCESS_BATCH') {
        try {
            const { data, columns, actions } = payload;
            const result = applyBatchTransform(data, columns, actions);
            self.postMessage({ type: 'BATCH_COMPLETE', payload: result });
        } catch (error) {
            self.postMessage({ type: 'BATCH_ERROR', payload: error.message });
        }
    }
};
