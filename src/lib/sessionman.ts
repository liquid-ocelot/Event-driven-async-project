import { FastifyReply, FastifyRequest } from 'fastify'
import cookie, { FastifyCookieOptions } from 'fastify-cookie'
import { getRepository } from 'typeorm'
import { Session } from '../entity/session'
import { User } from '../entity/user'
import { randomBytes } from 'crypto'
import { promisify } from 'util'


declare module 'fastify' {
    interface FastifyRequest {
        session?: Session
    }
}

export async function saveSession(reply: FastifyReply, user: User) {
    const id = (await promisify(randomBytes)(64)).toString('base64')
    await getRepository(Session).save({ id, user })
    void reply.setCookie("SCOOKIE", id, {
        signed: true,
        httpOnly: true,
        secure: false,
        maxAge: 15552000,
        path: '/'
    })
}

export async function loadSession(request: FastifyRequest) {
    console.log(request.cookies)
    if (!request.cookies["SCOOKIE"]) return


    const unsigned = request.unsignCookie(request.cookies["SCOOKIE"])
    console.log(unsigned)
    if (unsigned.value && unsigned.valid) request.session = await getRepository(Session).findOne(unsigned.value)
}