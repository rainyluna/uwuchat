import { Elysia, t } from 'elysia'
import { redis } from '@/lib/redis'
import Redis from 'ioredis'

interface ChatMessage {
    id: string
    sender: string
    text: string
    timestamp: number
    roomId: string
}

export const rooms = new Elysia({ prefix: '/rooms' })
    .post("/create/:roomId", async ({ params: { roomId } }) => {
        console.log(`Room created: ${roomId}`)
        const roomID = roomId
        const roomExists = await redis.exists(roomID)
        if (!roomExists) {
            await redis.hset(roomID, "users", JSON.stringify([]))
            await redis.hset(roomID, "messages", JSON.stringify([]))
            await redis.hset(roomID, "createdAt", new Date().toISOString())

            await redis.expire(roomID, 60 * 60 * 24)
        }
        return { roomID }
    })
    .post("/:roomId/messages", async ({ params: { roomId }, body }) => {
        const { sender, text } = body as { sender: string; text: string }

        const message: ChatMessage = {
            id: crypto.randomUUID(),
            sender,
            text,
            timestamp: Date.now(),
            roomId
        }

        await redis.rpush(`${roomId}:messages`, JSON.stringify(message))

        await Promise.all([
            redis.expire(`${roomId}:messages`, 60 * 60 * 24),
            redis.expire(roomId, 60 * 60 * 24)
        ])

        await redis.publish(`room:${roomId}`, JSON.stringify(message))

        return { success: true, message }
    })
    .get("/:roomId/messages", async ({ params: { roomId } }) => {
        const messages = await redis.lrange(`${roomId}:messages`, 0, -1)
        return messages.map(m => JSON.parse(m) as ChatMessage)
    })
    .get("/:roomId/stream", async ({ params: { roomId } }) => {
        const subscriber = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            db: Number(process.env.REDIS_DB),
        })

        const channel = `room:${roomId}`
        await subscriber.subscribe(channel)

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(`data: ${JSON.stringify({ type: 'connected', roomId })}\n\n`)

                subscriber.on('message', (ch, message) => {
                    if (ch === channel) {
                        controller.enqueue(`data: ${message}\n\n`)
                    }
                })
            },
            cancel() {
                subscriber.unsubscribe(channel)
                subscriber.quit()
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        })
    })

export const app = new Elysia({ prefix: '/api' })
    .use(rooms)

export type App = typeof app

export const GET = app.fetch
export const POST = app.fetch