/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ListGameBody = Game[];

export interface Game {
  id: number;
  name: string;
  players: User[];
  creator: User;
}
export interface User {
  id: number;
  username: string;
}
