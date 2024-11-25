import 'bulma/css/bulma.css';
import './style.css';

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnRefresh = document.getElementById('btn-refresh');
const ipList = document.getElementById('ip-list');
const log = document.getElementById('log');
const data = document.getElementById('data');

window.api.onLog((value) => {
    const p = document.createElement('p');
    p.textContent = value;
    log.appendChild(p);
    p.scrollIntoView();
});

window.api.onRefresh(() => {
    getData();
});

btnStart.addEventListener('click', async () => {
    btnStart.classList.add('is-loading');
    const ips = await window.api.start();
    btnStart.classList.remove('is-loading');
    btnStart.classList.add('is-hidden');
    btnStop.classList.remove('is-hidden');

    ipList.innerHTML = '';

    for (const [key, value] of Object.entries(ips)) {
        const strong = document.createElement('strong');
        strong.textContent = key;
        const ul = document.createElement('ul');
        for (const ip of value) {
            const li = document.createElement('li');
            li.textContent = ip;
            ul.appendChild(li);
        }
        ipList.appendChild(strong);
        ipList.appendChild(ul);
    }
    ipList.classList.remove('is-hidden');
});

btnStop.addEventListener('click', async () => {
    btnStop.classList.add('is-loading');
    await window.api.stop();
    btnStop.classList.remove('is-loading');
    btnStart.classList.remove('is-hidden');
    btnStop.classList.add('is-hidden');
    ipList.classList.add('is-hidden');
});

function createTable(data) {
    const table = document.createElement('table');
    table.className = 'table is-hoverable is-fullwidth is-bordered';

    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    data.forEach((item) => {
        const row = document.createElement('tr');
        for (const key in item) {
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
        }
        table.appendChild(row);
    });

    return table;
}

async function getData() {
    const dbData = await window.api.getData();
    const table = createTable(dbData);
    data.innerHTML = '';
    data.appendChild(table);
}

btnRefresh.addEventListener('click', async () => {
    btnRefresh.classList.add('is-loading');
    await getData();
    btnRefresh.classList.remove('is-loading');
});

getData();
