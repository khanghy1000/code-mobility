import knex from 'knex';

const db = knex({
    client: 'better-sqlite3',
    connection: {
        filename: './db.sqlite',
    },
    useNullAsDefault: true,
});

db.schema.hasTable('data').then(function (exists) {
    if (!exists) {
        return db.schema.createTable('data', function (t) {
            t.increments('id').primary();
            t.string('data', 255);
        });
    }
});

export default db;
