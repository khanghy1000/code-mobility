import express from 'express';
import cors from 'cors';
import db from './db';
import morgan from 'morgan';
import { BrowserWindow } from 'electron';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

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

app.get('/data', async (_req, res) => {
    const data = await db('data').select().orderBy('id');
    res.json(data);
});

app.post('/data', async (req, res) => {
    const data = req.body.data;
    const inserted = await db('data')
        .returning(['id', 'data'])
        .insert({ data });

    res.json(inserted);
});

app.delete('/data/:id', async (req, res) => {
    const id = req.params.id;
    await db('data').where('id', id).del();

    res.json({ message: 'Deleted' });
});

export default app;
