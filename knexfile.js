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
      host: 'ec2-54-83-11-247.compute-1.amazonaws.com',
      database: 'd9nc9hmqndl59i',
      user:     'zwdjszhzxtbopy',
      password: 'dd9ef4f815d6e0d1ec7c43988c94326ff06ce9998ea544e26f8c6c2500be943f'
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
