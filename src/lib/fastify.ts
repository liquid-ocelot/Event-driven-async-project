import cookie, { FastifyCookieOptions } from 'fastify-cookie'
import fastify from 'fastify'
import { userRoutes } from './userman'
import { gameRoutes } from './gameman'
import { COOKIE_SECRET, FASTIFY_LOGGING } from './dotenv'



export const fs = fastify({ logger: FASTIFY_LOGGING })
.register(cookie, {secret:COOKIE_SECRET } as FastifyCookieOptions)
.register(userRoutes, {prefix:"/user"})
.register(gameRoutes, {prefix:"/game"})
