import { Elysia, t } from 'elysia'
import { redis } from '@/lib/redis'

export const rooms = new Elysia({ prefix: '/rooms' }).post("/create/:roomId", ({ params: { roomId } }) => {
    console.log(`Room created: ${roomId}`)
    const roomID = roomId
    redis.hset(roomID, "users", JSON.stringify([]))
    redis.hset(roomID, "messages", JSON.stringify([]))
})

export const app = new Elysia({ prefix: '/api' })
    .use(rooms)

export type App = typeof app

export const GET = app.fetch
export const POST = app.fetch