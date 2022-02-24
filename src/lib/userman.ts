/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as bcrypt from "bcrypt"
import { FastifyInstance } from "fastify";

import { getRepository} from "typeorm";
import { User } from "../entity/User";
import { UserParams } from "../schemas/types/user.params";


import * as userParamsSchema from "../schemas/json/user.params.json";



export async function userRoutes(fastify:FastifyInstance) {
    fastify.post<{Body: UserParams}>("/",{
        schema:{
            body: userParamsSchema
        },
        handler: async function createUser(request, reply){


                const userRepo = getRepository(User);
        
                const user = new User();
                user.username = request.body.username;
                
        
                if (await userRepo.findOne({username: user.username})) {

                    return reply.code(409).send()
            
                }
            
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(request.body.password, salt, async (err, hash) => {
                        user.password = hash;
                        await userRepo.save(user);
                    })
                })
                return reply.code(201).send();
            
            }
            
        }
    ),
    fastify.post<{Body: UserParams}>("/login",{
        schema:{
            body: userParamsSchema
        },
        handler: async function createUser(request, reply){


                const userRepo = getRepository(User);
        
                // const user = new User();
                // user.username = request.body.username;
 
                const user = await userRepo.findOne({username: request.body.username});

                if (user) {
                    await bcrypt.compare(request.body.password, user.password).then( (result) =>{
                        if(result){
                            return reply.code(200).send();
                        }else{
                            return reply.code(401).send();
                        }
                    }

                    );
                    
            
                }else{
                    return reply.code(404).send()
                }
            
                return reply.code(500).send()
            }
            
        }
    )
}



