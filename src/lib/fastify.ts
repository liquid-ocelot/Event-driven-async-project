import cookie, { FastifyCookieOptions } from 'fastify-cookie'
import fastify from 'fastify'
import { userRoutes } from './userman'
import { gameRoutes } from './gameman'
import { COOKIE_SECRET, FASTIFY_LOGGING } from './dotenv'



export const fs = fastify({ logger: FASTIFY_LOGGING })
.register(cookie, {secret:COOKIE_SECRET } as FastifyCookieOptions)
.register(userRoutes, {prefix:"/user"})
.register(gameRoutes, {prefix:"/game"})
.setErrorHandler(function defaultErrorHandler(error, request, reply){
    if(reply.statusCode < 500){
        reply.log.info(
            {res: reply, err:error},
            error && error.message
        )
        void reply.send(error)
    }else{
        reply.log.error(
            {req: request, res: reply, err: error},
            error && error.message
        )
        void reply.send({statusCode:500, error:"Internal Server Error", message:'[TRUNCATED]'})
    }
})