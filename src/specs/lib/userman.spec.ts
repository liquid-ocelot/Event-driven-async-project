
import { fs } from "../../lib/fastify";
import { expect } from "chai";

describe("user route", function () {

    it("should create a user", async function () {

        const response = await fs.inject({
            method: "POST",
            url: '/user',
            payload: { username: "jojo", password: "test" },
            
        })

        expect(response.statusCode).to.equal(201)
        
    })

})