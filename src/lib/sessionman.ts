import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import cookie, { FastifyCookieOptions } from 'fastify-cookie'
import { getRepository } from 'typeorm'
import { Session } from '../entity/session'
import { User } from '../entity/user'
import { randomBytes } from 'crypto'
import { promisify } from 'util'
import { COOKIE_HTTP_ONLY, COOKIE_MAX_AGE, COOKIE_NAME, COOKIE_SECURE, COOKIE_SIGNED } from './dotenv'


declare module 'fastify' {
    interface FastifyRequest {
        session?: Session
    }
}

//https://github.com/TruffeCendree/student-peer-review/blob/9842e1c412999212a43a48420fc5ef41efefde31/src/lib/session.ts#L15
export async function saveSession(reply: FastifyReply, user: User) {
    const id = (await promisify(randomBytes)(64)).toString('base64')
    await getRepository(Session).save({ id, user })
    void reply.setCookie(COOKIE_NAME, id, {
        signed: COOKIE_SIGNED,
        httpOnly: COOKIE_HTTP_ONLY,
        secure: COOKIE_SECURE,
        maxAge: COOKIE_MAX_AGE,
        path: '/'
    })
}

export async function loadSession(request: FastifyRequest) {

    if (!request.cookies[COOKIE_NAME]) return


    const unsigned = request.unsignCookie(request.cookies[COOKIE_NAME])

    if (unsigned.value && unsigned.valid) request.session = await getRepository(Session).findOne(unsigned.value)
}

export async function checkAuth(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction){
    await loadSession(request);
    if (request.session) {

        return 
    }
    else{

        return reply.code(401).send()
    }
    
    
}



export async function deleteSession(request: FastifyRequest, reply: FastifyReply) {
    const sessionRep = getRepository(Session)

    if (!request.cookies[COOKIE_NAME]) return

    const unsigned = request.unsignCookie(request.cookies[COOKIE_NAME])
    if (unsigned.value && unsigned.valid){
        const session = await sessionRep.findOne(unsigned.value).catch(() => { return reply.code(500).send() })
        await sessionRep.delete(session.id).catch(() => { return reply.code(500).send() })
        void reply.clearCookie(COOKIE_NAME, {
            path: '/'
        })
    }
}
