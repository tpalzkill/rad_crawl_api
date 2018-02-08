// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
        connection: {
          database: 'rad_crawls',
          user:     '',
          password: '',
          host: '127.0.0.1'
        }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: 'ec2-107-22-241-243.compute-1.amazonaws.com',
      database: 'dtb4g74pqbthp',
      user:     'qdnxwusmtzvscd',
      password: '3197d17981c5ccfd7470a4f40193534d35e07a8425f593fc03f12d09f1915592'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
