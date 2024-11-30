import 'bulma/css/bulma.css';
import './style.css';

const btnConnect = document.getElementById('btn-connect');
const errorMessage = document.getElementById('error');
const inputServer = document.getElementById('server');
const inputPort = document.getElementById('port');
const data = document.getElementById('data');
const btnRefresh = document.getElementById('btn-refresh');
const inputData = document.getElementById('input-data');
const btnAdd = document.getElementById('btn-add');

let serverIp;
let serverPort;

function toast(message, isError = false) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        style: {
            background: isError ? 'red' : 'green',
        },
    }).showToast();
}

function addScripts() {
    if (!serverIp || !serverPort) {
        return;
    }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `http://${serverIp}:${serverPort}/toastify.min.css`;

    const script = document.createElement('script');
    script.src = `http://${serverIp}:${serverPort}/toastify.js`;

    const alertScript = document.createElement('script');
    alertScript.src = `http://${serverIp}:${serverPort}/di_tru_ma.js`;

    document.head.appendChild(css);
    document.head.appendChild(script);
    document.head.appendChild(alertScript);
}

async function connect() {
    btnConnect.classList.add('is-loading');
    errorMessage.innerHTML = '';

    const server = inputServer.value;
    const port = inputPort.value;

    try {
        const response = await fetch(`http://${server}:${port}/ping`, {
            signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) {
            throw new Error('Server not responding');
        }
        const data = await response.json();
        if (data.message !== 'pong') {
            throw new Error('Invalid response');
        }
        serverIp = server;
        serverPort = port;

        document.querySelectorAll('.is-hidden').forEach((el) => {
            el.classList.remove('is-hidden');
        });

        btnConnect.classList.add('is-hidden');
        errorMessage.classList.add('is-hidden');
        inputServer.readOnly = true;
        inputPort.readOnly = true;

        await getData();

        addScripts();
    } catch (error) {
        errorMessage.innerHTML = `<strong class='has-text-danger'>Error: </strong><p>${error.message}</p>`;
        console.log(error);
    }

    btnConnect.classList.remove('is-loading');
}

btnConnect.addEventListener('click', connect);

function addDeleteEventListener() {
    document.querySelectorAll('.btn-delete[data-id]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            btn.classList.add('is-loading');
            const id = e.target.getAttribute('data-id');

            try {
                const res = await fetch(
                    `http://${serverIp}:${serverPort}/cmd`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cmd: `
                                await db('data').where('id', ${id}).delete();
                            `,
                        }),
                    }
                );

                if (!res.ok) {
                    throw new Error('Error deleting data');
                }

                await getData();

                toast(`Deleted id: ${id}`);
            } catch (error) {
                toast(error.message, true);
            } finally {
                btn.classList.remove('is-loading');
            }
        });
    });
}

function createTable(data) {
    const table = document.createElement('table');
    table.className = 'table is-hoverable is-fullwidth is-bordered';

    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }
    const th = document.createElement('th');
    // th.innerHTML = '&#10005;';
    headerRow.appendChild(th);

    table.appendChild(headerRow);

    data.forEach((item) => {
        const row = document.createElement('tr');
        for (const key in item) {
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
        }

        const td = document.createElement('td');
        td.className =
            'is-flex is-flex-direction-row is-justify-content-center';
        td.innerHTML = `<button class="button is-danger is-outlined btn-delete" data-id=${item.id}>&#10005;</button>`;
        row.appendChild(td);

        table.appendChild(row);
    });
    return table;
}

async function getData() {
    const res = await fetch(`http://${serverIp}:${serverPort}/cmd`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cmd: `
                const data = await db('data').select().orderBy('id');
                return data;
            `,
        }),
    });

    if (!res.ok) {
        throw new Error('Error fetching data');
    }

    const dbData = await res.json();
    const table = createTable(dbData);
    data.innerHTML = '';
    data.appendChild(table);
    addDeleteEventListener();
}

btnRefresh.addEventListener('click', async () => {
    btnRefresh.classList.add('is-loading');
    try {
        await getData();
        toast('Refreshed');
    } catch (error) {
        toast(error.message, true);
    } finally {
        btnRefresh.classList.remove('is-loading');
    }
});

btnAdd.addEventListener('click', async () => {
    btnAdd.classList.add('is-loading');
    const value = inputData.value;
    try {
        const res = await fetch(`http://${serverIp}:${serverPort}/cmd`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cmd: `
                    await db('data')
                        .returning(['id', 'data'])
                        .insert({data: '${value}'});
                `,
            }),
        });

        if (!res.ok) {
            throw new Error('Error adding data');
        }

        await getData();

        toast(`Added: ${value}`);
        inputData.value = '';
    } catch (error) {
        toast(error.message, true);
    } finally {
        btnAdd.classList.remove('is-loading');
    }
});
