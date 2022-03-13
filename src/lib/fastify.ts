import cookie, { FastifyCookieOptions } from "fastify-cookie";
import fastify from "fastify";
import { userRoutes } from "./userman";
import { gameRoutes } from "./gameman";
import swagger from "fastify-swagger";
import { COOKIE_SECRET, FASTIFY_LOGGING } from "./dotenv";

export const fs = fastify({ logger: FASTIFY_LOGGING })
	.register(swagger, {
		routePrefix: "/swagger",
		swagger: {
			info: {
				title: "Map Generator API",
				description: "fuck if i know",
				version: "0.0.0.0.1",
			},
			externalDocs: {
				url: "https://swagger.io",
				description: "Find more info here",
			},
			host: "localhost:8087",
			schemes: ["http"],
			consumes: ["application/json"],
			produces: ["application/json"],
		},
		exposeRoute: true,
	})
	.register(cookie, { secret: COOKIE_SECRET } as FastifyCookieOptions)
	.register(userRoutes, { prefix: "/user" })
	.register(gameRoutes, { prefix: "/game" })
	.setErrorHandler(function defaultErrorHandler(error, request, reply) {
		if (reply.statusCode < 500) {
			reply.log.info({ res: reply, err: error }, error && error.message);
			void reply.send(error);
		} else {
			reply.log.error({ req: request, res: reply, err: error }, error && error.message);
			void reply.send({ statusCode: 500, error: "Internal Server Error", message: "[TRUNCATED]" });
		}
	});
