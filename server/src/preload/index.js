import { contextBridge, ipcRenderer } from 'electron';

const api = {
    start: () => ipcRenderer.invoke('server:start'),
    stop: () => ipcRenderer.invoke('server:stop'),
    getLocalIps: () => ipcRenderer.invoke('ip:get'),
    getData: () => ipcRenderer.invoke('db:getData'),
    onLog: (callback) =>
        ipcRenderer.on('log', (_event, value) => callback(value)),
    onRefresh: (callback) =>
        ipcRenderer.on('data:refresh', (_event, value) => callback(value)),
};

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    console.error('contextIsolated is not enabled');
}
