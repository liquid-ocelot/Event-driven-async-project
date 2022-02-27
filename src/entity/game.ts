import { Entity, ManyToOne, RelationId, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm'
import { User } from './User'

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, { eager: true, cascade: ['insert'], nullable: false })
    creator!: User

    @RelationId((game: Game) => game.creator)
    creatorid!: number

    @ManyToMany(() => User, players => players.games)
    @JoinTable()
    players: Promise<User[]>
}