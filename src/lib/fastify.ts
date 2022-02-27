import cookie, { FastifyCookieOptions } from 'fastify-cookie'
import fastify from 'fastify'
import { userRoutes } from './userman'


export const fs = fastify({ logger: true })
.register(cookie, {secret:"test secret" } as FastifyCookieOptions)
.register(userRoutes, {prefix:"/user"})
