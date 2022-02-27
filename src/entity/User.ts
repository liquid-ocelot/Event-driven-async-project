import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Game } from "./game";
import { Session } from "./session";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @OneToMany(() => Session, session => session.user)
    sessions!: Promise<Session[]>
    
    @OneToMany(() => Game, game => game.creator)
    gameCreated!: Promise<Game[]>

    @ManyToMany(() => Game, game => game.players)
    games: Promise<Game[]>
}
