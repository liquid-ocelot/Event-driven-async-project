
import { fs } from "../../lib/fastify";
import { expect } from "chai";


describe("user route", function () {


    describe("/user", function(){
        it("should create a user", async function () {

            const response = await fs.inject({
                method: "POST",
                url: '/user',
                payload: { username: "jojo", password: "test" },
                
            })
    
            expect(response.statusCode).to.equal(201)
            
        })

        it("should send an error when trying to create the same user", async function () {

            await fs.inject({
                method: "POST",
                url: '/user',
                payload: { username: "Giogio", password: "test" },
                
            })

            const response = await fs.inject({
                method: "POST",
                url: '/user',
                payload: { username: "Giogio", password: "test" },
                
            })
    
            expect(response.statusCode).to.equal(409)
            
        })

        it("should send an error when trying to resolve the user when not logged in", async function () {
            const response = await fs.inject({
                method: "GET",
                url: '/user',
                
            })
            expect(response.statusCode).to.equal(404)
            
        })

        it("should resolve the user", async function () {
            
            const connect_request = await fs.inject({
                method: "POST",
                url: '/user/login',
                payload: { username: "TestMan", password: "test" }
            })

            const session_cookie = connect_request.cookies.find((cookie:{name:string}) => cookie.name === "SCOOKIE") as {name:string, value: string, maxAge: number, path: string, httpOnly: boolean}


            const response = await fs.inject({
                method: "GET",
                url: '/user',
                cookies:{["SCOOKIE"]: session_cookie.value}
            })
            expect(response.statusCode).to.equal(200)
            
        })
    })


    describe("/user/login", function(){
        it("should connect a user", async function () {

    
            const response = await fs.inject({
                method: "POST",
                url: '/user/login',
                payload: { username: "TestMan", password: "test" },
                
            })
    
            expect(response.statusCode).to.equal(200)
            const cookies = response.cookies.map((cookie:{name:string}) => cookie.name)
            expect(cookies).to.contain("SCOOKIE")
            
        })

        it("should send an error when login with wrong password", async function () {

    
            const response = await fs.inject({
                method: "POST",
                url: '/user/login',
                payload: { username: "TestMan", password: "wrong password" },
                
            })
    
            expect(response.statusCode).to.equal(401)

            
        })
    })

    

    describe("/user/logout", function(){
        it("should disconnect a user", async function () {

    
            const connect_req = await fs.inject({
                method: "POST",
                url: '/user/login',
                payload: { username: "TestMan", password: "test" },
                
            })
    
            const session_cookie = connect_req.cookies.find((cookie:{name:string}) => cookie.name === "SCOOKIE") as {name:string, value: string, maxAge: number, path: string, httpOnly: boolean}

            const response = await fs.inject({
                method: "DELETE",
                url: '/user/logout',
                cookies:{["SCOOKIE"]: session_cookie.value}
                
            })


            expect(response.statusCode).to.equal(200)
            
        })

    })
   

})