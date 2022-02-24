import fastifyFactory from 'fastify'
import { userRoutes } from './userman'


export const fs = fastifyFactory({ logger: true })
.register(userRoutes, {prefix:"/user"})
