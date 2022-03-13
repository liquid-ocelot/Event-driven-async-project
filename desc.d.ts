declare module "CppGenerator" {

    export function generateAndGetMapAsString(
        height: number,
        width: number,
        seed: number,
        noSeed: boolean,
        perThousand: number
    ): string;


}