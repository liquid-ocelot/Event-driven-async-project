
import { FastifyInstance } from "fastify";

import { getRepository } from "typeorm";


import { CreateGameBody } from "../schemas/types/createGame.body";
import * as createGameBodySchema from "../schemas/json/createGame.body.json";
import { loadSession } from "./sessionman";
import { Game } from "../entity/game";



export async function gameRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: CreateGameBody }>("/", {
        schema: {
            body: createGameBodySchema
        },
        handler: async function createGame(request, reply) {
            await loadSession(request);

            if(request.session){
                const gameRepo = getRepository(Game);

                const game = new Game()
                game.name = request.body.name;
                game.creator = request.session.user

                const saved_game = await gameRepo.save(game).catch(() => {return reply.code(500).send()})
                return reply.code(201).send({
                    id: saved_game.id,
                    name: saved_game.name
                });
            }else{
                return reply.code(401).send()
            }

        }

    })
}
    