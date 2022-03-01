
import { FastifyInstance } from "fastify";

import { getRepository } from "typeorm";


import { CreateGameBody } from "../schemas/types/createGame.body";
import * as createGameBodySchema from "../schemas/json/createGame.body.json";
import { AddUserGameBody } from "../schemas/types/addUserToGame.body";
import * as addUserGameBodySchema from "../schemas/json/addUserToGame.body.json"

import { checkAuth } from "./sessionman";
import { Game } from "../entity/game";
import { User } from "../entity/User";



export async function gameRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: CreateGameBody }>("/", {
        schema: {
            body: createGameBodySchema
        },
        preHandler: checkAuth
        ,
        handler: async function createGame(request, reply) {

            const gameRepo = getRepository(Game);

            const game = new Game()
            game.name = request.body.name;
            game.creator = request.session.user

            const saved_game = await gameRepo.save(game).catch(() => { return reply.code(500).send() })
            return reply.code(201).send({
                id: saved_game.id,
                name: saved_game.name
            });
        }

    }),
    fastify.get("/", {
        schema: {
            
        },
        preHandler: checkAuth
        ,
        handler: async function getGamesInfo(request, reply) {
            const gameRepo = getRepository(Game);

            const games = await gameRepo.find({ relations:["players"], where:{creator:request.session.user}})

            return reply.code(200).send(games)
        }

    }),
    fastify.post<{Body: AddUserGameBody}>("/addUser", {
        schema: {
            body:addUserGameBodySchema
        },
        preHandler: checkAuth
        ,
        handler: async function addUserToGame(request, reply) {
            const gameRepo = getRepository(Game);
            const userRepo = getRepository(User)

            const user = await userRepo.findOne({id:request.body.idUser})
            const game = await gameRepo.findOne({id: request.body.idGame}, {relations:["players"]})

            if(game.players == undefined){
                game.players = []
            }
            
            game.players.push(user)

            await gameRepo.save(game)

            return reply.code(200).send()
        }

    })
}
