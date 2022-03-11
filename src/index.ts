import {createConnection} from "typeorm";
import "reflect-metadata";
import { fs } from "./lib/fastify";
import { Game } from "./entity/game";
import { Session } from "./entity/session";
import { User } from "./entity/user";
// import {createConnection} from "typeorm";
// import {User} from "./entity/User";

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.password = "Timber";
//     user.username = "Saw";

//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));

async function run(){
    await createConnection();
    await fs.listen(8080);
}


run().catch(console.error)