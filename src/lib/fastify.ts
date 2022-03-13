import cookie, { FastifyCookieOptions } from "fastify-cookie";
import fastify from "fastify";
import { userRoutes } from "./userman";
import { gameRoutes } from "./gameman";
import swagger from "fastify-swagger";
import { COOKIE_SECRET, FASTIFY_LOGGING } from "./dotenv";
import * as pino from "pino";
import * as ppretty from "pino-pretty";

const pretty_dest = ppretty.default({
	destination:"./server.log",
	colorize:false,
	translateTime:"yyyy-mm-dd HH:MM:ss.l o",
	singleLine:true
})



const logger = pino.pino({
	enabled: FASTIFY_LOGGING,
	level:"info",
	redact:['req.headers.authorization', 'req.body.password']
}, pretty_dest)

export const fs = fastify({ logger: logger })
	.register(swagger, {
		routePrefix: "/swagger",
		swagger: {
			info: {
				title: "Map Generator API",
				description: "Event driven async project",
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
