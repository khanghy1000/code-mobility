import { ipcMain } from 'electron';
import { getLocalIps } from './utils';
import app from './app';
import db from './db';

let server;

ipcMain.handle('server:start', () => {
    return new Promise((resolve) => {
        server = app.listen(3000, () => {
            console.log('Listening on http://localhost:3000');
            const ips = getLocalIps();
            ips['Port'] = [3000];
            resolve(ips);
        });
    });
});

ipcMain.handle('server:stop', () => {
    return new Promise((resolve) => {
        server.close(() => {
            console.log('Server stopped');
            resolve();
        });
    });
});

ipcMain.handle('ip:get', () => {
    return getLocalIps();
});

ipcMain.handle('db:getData', () => {
    return db('data').select().orderBy('id');
});
