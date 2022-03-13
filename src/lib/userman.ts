/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";

import { getRepository } from "typeorm";
import { User } from "../entity/user";
import { UserBody } from "../schemas/types/user.body";

import * as userBodySchema from "../schemas/json/user.body.json";
import { deleteSession, loadSession, saveSession } from "./sessionman";

export async function userRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: UserBody }>("/", {
		schema: {
			body: userBodySchema,
		},
		handler: async function createUser(request, reply) {
			const userRepo = getRepository(User);

			const user = new User();
			user.username = request.body.username;

			if (await userRepo.findOne({ username: user.username })) {
				return reply.code(409).send();
			}

			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(request.body.password, salt);
			user.password = hash;
			await userRepo.save(user);
			return reply.code(201).send();
		},
	}),
		fastify.post<{ Body: UserBody }>("/login", {
			schema: {
				body: userBodySchema,
			},
			handler: async function createUser(request, reply) {
				const userRepo = getRepository(User);

				const user = await userRepo.findOne({ username: request.body.username });

				if (user) {
					const result = await bcrypt.compare(request.body.password, user.password);
					if (result) {
						await saveSession(reply, user);
						return reply.code(200).send();
					} else {
						return reply.code(401).send();
					}
				} else {
					return reply.code(404).send();
				}
			},
		}),
		fastify.get("/", {
			handler: async function resolve(request, reply) {
				await loadSession(request);

				if (request.session) {
					return reply.code(200).send({ username: request.session.user.username, id: request.session.user.id });
				} else {
					return reply.code(404).send();
				}
			},
		}),
		fastify.delete("/logout", {
			handler: async function logout(request, reply) {
				await deleteSession(request, reply);

				return reply.code(200).send();
			},
		});
}
