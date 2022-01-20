const { Sequelize } = require("sequelize/dist");

const db = new Sequelize(
    process.env.DATABASE_URL
    ||
    `postgresql://postgres:${encodeURIComponent(process.env.PASS)}@localhost/fol`,
    process.env.HOST == 'local' ?
        {
            dialect: 'postgres'
        } :
        {

            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        }
)

module.exports = db;