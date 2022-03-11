import { Connection, createConnection, getRepository } from "typeorm";
import { Game } from "../../entity/game";
import { Session } from "../../entity/session";
import { User } from "../../entity/user";









export class TestUtil {

    dbConn: Connection;

    /**
     * Creates an instance of TestUtils
     */
    constructor() {
        if (process.env.NODE_ENV !== 'test') {
            console.log(process.env)
            throw new Error('ERROR-TEST-UTILS-ONLY-FOR-TESTS');
        }

    }

    async openDbConnection() {
        this.dbConn = await createConnection({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "admin",
            database: "pgtest",
            synchronize: true,
            entities: [
                Session, User, Game
            ],
            migrations: [
                "../../migration/**/*.ts"
            ],
            subscribers: [
                "../../subscriber/**/*.ts"
            ],
            cli: {
                "entitiesDir": "../../entity",
                "migrationsDir": "../../migration",
                "subscribersDir": "../../subscriber"
            }
        });
    }

    /**
     * Closes the database connections
     */
    async closeDbConnection() {
        await this.dbConn.close()
    }


    /**
     * Cleans the database and reloads the entries
     */
    async reloadFixtures() {
        await this.dbConn.synchronize()
        await this.cleanAll();
        const user = new User()
        user.username = "TestMan"
        user.password = "$2b$10$Cj1LsPQ2DW2HLo7gsRxcSObPtH3ofOvCkLSMQxdRFIYzf7.DUUA4O"
        const userRepo = getRepository(User);
        await userRepo.save(user)
    }

    /**
     * Cleans all the entities
     */
    async cleanAll() {
        const entities = this.dbConn.entityMetadatas;
        for (const entity of entities) {
            const repo = this.dbConn.getRepository(entity.name)
            await repo.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`)
        }
    }


}


const testUtil = new TestUtil() 

before(async function(){
    await testUtil.openDbConnection()
    await testUtil.reloadFixtures()
})

after(async function(){
    await testUtil.closeDbConnection()
})