/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// import { generateAndGetMapAsString } from "CppGenerator";


const cpp = require("../../CppGenerator.node")



export function generateMap(height, width, seed, noSeed, perThousand){

    return cpp.generateAndGetMapAsString(height,width,seed,noSeed,perThousand) as string;
}