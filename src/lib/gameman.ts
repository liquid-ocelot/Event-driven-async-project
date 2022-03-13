
import { FastifyInstance } from "fastify";

import { getRepository, In } from "typeorm";


import { CreateGameBody } from "../schemas/types/createGame.body";
import * as createGameBodySchema from "../schemas/json/createGame.body.json";
import { AddUserGameBody } from "../schemas/types/addUserToGame.body";
import * as addUserGameBodySchema from "../schemas/json/addUserToGame.body.json"
import * as listGameBodySchema from "../schemas/json/listGame.body.json"

import { GeneratorInputBody } from "../schemas/types/generatorInput.body";
import * as generatorInputBodySchema from "../schemas/json/generatorInput.body.json"

import { ParamId } from "../schemas/types/param.id";
import * as paramIdSchema from "../schemas/json/param.id.json"


import { checkAuth } from "./sessionman";
import { Game } from "../entity/game";
import { User } from "../entity/user";
import { generateMap } from "./generator";



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
            game.players = [request.session.user]
            game.map = "";

            const saved_game = await gameRepo.save(game).catch(() => { return reply.code(500).send() })
            fastify.log.info(`Game ${saved_game.id} : ${saved_game.name} created`)
            return reply.code(201).send({
                id: saved_game.id,
                name: saved_game.name
            });
        }

    }),
    fastify.get("/", {
        schema: {
            response:{
                200:listGameBodySchema
            }
        },
        preHandler: checkAuth
        ,
        handler: async function getGamesInfo(request, reply) {

            const gameRepo = getRepository(Game);

            const userRepo = getRepository(User);
            const user = await userRepo.findOne({relations:["games"], where:{id:request.session.userId}}).catch(() => { return reply.code(500).send() })
            const idGames = user.games.map(g => g.id)
            const games = await gameRepo.find({relations:["players"], where:{id:In(idGames)}}).catch(() => { return reply.code(500).send() })
            

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

            const user = await userRepo.findOne({id:request.body.idUser}).catch(() => { return reply.code(500).send() })
            const game = await gameRepo.findOne({id: request.body.idGame}, {relations:["players"]}).catch(() => { return reply.code(500).send() })

            if(game.creatorid !== request.session.userId){
                return reply.code(403).send()
            }

            if(game.players == undefined){
                game.players = []
            }
            
            game.players.push(user)

            await gameRepo.save(game)

            return reply.code(200).send()
        }

    }),
    fastify.post<{Body: GeneratorInputBody}>("/createMap", {
        schema: {
            body:generatorInputBodySchema
        },
        preHandler: checkAuth,
        
        handler: async function createMap(request, reply) {

            const gameRepo = getRepository(Game);
            const game = await gameRepo.findOne({id: request.body.gameId}).catch(() => { return reply.code(500).send() });

            if(game.creatorid !== request.session.userId){
                return reply.code(401).send()
            }

            const map = generateMap(
                request.body.height,
                request.body.width,
                request.body.seed,
                request.body.noSeed,
                request.body.perThousand,
            );

            game.map = map;

            await gameRepo.save(game).catch(() => { return reply.code(500).send() })

            return reply.code(200).send({"map": map})
        }

    }),
    fastify.get<{Params: ParamId}>("/map/:id", {
        schema: {
            params:paramIdSchema
        },
        preHandler: checkAuth,
        
        handler: async function readMap(request, reply) {

            const gameRepo = getRepository(Game);
            const game = await gameRepo.findOne({id: request.params.id}).catch(() => { return reply.code(500).send() });



            return reply.code(200).send({"map": game.map})
        }

    })
}
