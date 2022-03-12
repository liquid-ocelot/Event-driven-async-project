import { createConnection } from "typeorm";
import "reflect-metadata";
import { fs } from "./lib/fastify";
import { DATABASE_HOST, DATABASE_LOGGING, DATABASE_NAME, DATABASE_PASS, DATABASE_PORT, DATABASE_SYNC, DATABASE_USER, FASTIFY_PORT } from "./lib/dotenv";

async function run() {
    console.log({
        type: "postgres",
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        username: DATABASE_USER,
        password: DATABASE_PASS,
        database: DATABASE_NAME,
        synchronize: DATABASE_SYNC,
        logging: DATABASE_LOGGING,
    })
    await createConnection(
        {
            type: "postgres",
            host: DATABASE_HOST,
            port: DATABASE_PORT,
            username: DATABASE_USER,
            password: DATABASE_PASS,
            database: DATABASE_NAME,
            synchronize: DATABASE_SYNC,
            logging: DATABASE_LOGGING,
            entities: [
                "src/entity/**/*.ts"
             ],
             migrations: [
                "src/migration/**/*.ts"
             ],
             subscribers: [
                "src/subscriber/**/*.ts"
             ],
             cli: {
                "entitiesDir": "src/entity",
                "migrationsDir": "src/migration",
                "subscribersDir": "src/subscriber"
             }
        }

    );
    await fs.listen(FASTIFY_PORT);
}


run().catch(console.error)