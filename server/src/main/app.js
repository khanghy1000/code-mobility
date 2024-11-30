/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import db from './db';
import morgan from 'morgan';
import { BrowserWindow } from 'electron';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));

morgan.token('time', () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
});

app.use(
    morgan('[:time] :remote-addr :method :url :status - :response-time ms', {
        stream: {
            write: (msg) => {
                console.log(msg.trim());
                BrowserWindow.getAllWindows()[0].webContents.send(
                    'log',
                    msg.trim()
                );
            },
        },
    })
);

app.get('/ping', (_req, res) => {
    res.json({ message: 'pong' });
});

app.post('/cmd', async (req, res) => {
    const result = await eval('(async function() {' + req.body.cmd + '}())');

    BrowserWindow.getAllWindows()[0].webContents.send('data:refresh');

    return res.json(result);
});

export default app;
