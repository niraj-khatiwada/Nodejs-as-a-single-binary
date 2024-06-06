import 'dotenv/config'

import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { type z } from 'zod'
import { DATABASE_URL } from './env'
import {
  insertPostSchema,
  insertUserSchema,
  posts,
  selectPostSchema,
  selectUserSchema,
  users,
} from './schema'

const client = new Database(DATABASE_URL)
export const db: BetterSQLite3Database = drizzle(client)

export const app = new Hono()

app.onError((err, ctx) => {
  if ('format' in err) {
    console.error(JSON.stringify((err as z.ZodError).format(), undefined, 2))
  } else {
    console.error(err)
  }
  return ctx.json({ error: 'Internal Server Error' }, 500)
})

app.use('*', cors())

const listUsersResponse = selectUserSchema.array()

app.get('/users', async (ctx) => {
  const allUsers = await db.select().from(users).all()
  return ctx.json(listUsersResponse.parse(allUsers))
})

const insertUserRequest = insertUserSchema.pick({
  name: true,
  email: true,
})
const insertUserResponse = selectUserSchema

app.post('/users', zValidator('json', insertUserRequest), async (ctx) => {
  const data = ctx.req.valid('json')
  const user = db.insert(users).values(data).returning().get()
  return ctx.json(insertUserResponse.parse(user))
})

const updateUserRequest = insertUserRequest.partial()
const updateUserResponse = selectUserSchema

app.patch('/users/:id', zValidator('json', updateUserRequest), async (ctx) => {
  const data = ctx.req.valid('json')
  const user = await db
    .update(users)
    .set(data)
    .where(eq(users.id, +ctx.req.param('id')))
    .returning()
    .get()
  return ctx.json(updateUserResponse.parse(user))
})

const getUserResponse = selectUserSchema.extend({
  posts: selectPostSchema.array(),
})

app.get('/users/:id', async (ctx) => {
  const user = await db.select().from(users)

  if (!user) return ctx.json({ error: 'User not found' }, 404)

  return ctx.json(getUserResponse.parse(user))
})

const deleteUserResponse = selectUserSchema.pick({ id: true })

app.delete('/users/:id', async (ctx) => {
  const user = await db
    .delete(users)
    .where(eq(users.id, +ctx.req.param('id')))
    .returning({ id: users.id })
    .get()
  return ctx.json(deleteUserResponse.parse(user))
})

const listPostsResponse = selectPostSchema.array()

app.get('/posts', async (ctx) => {
  const allPosts = await db.select().from(posts).all()
  return ctx.json(listPostsResponse.parse(allPosts))
})

app.get('/users/:id/posts', async (ctx) => {
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, +ctx.req.param('id')))
    .all()
  return ctx.json(listPostsResponse.parse(allPosts))
})

const insertPostRequest = insertPostSchema.pick({
  title: true,
  body: true,
  authorId: true,
})

const updatePostRequest = insertPostRequest
  .pick({ title: true, body: true })
  .partial()
const updatePostResponse = selectPostSchema

app.patch('/posts/:id', zValidator('json', updatePostRequest), async (ctx) => {
  const data = ctx.req.valid('json')
  const post = await db
    .update(posts)
    .set(data)
    .where(eq(posts.id, +ctx.req.param('id')))
    .returning()
    .get()
  return ctx.json(updatePostResponse.parse(post))
})

const getPostResponse = selectPostSchema

app.get('/posts/:id', async (ctx) => {
  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.id, +ctx.req.param('id')))
    .get()
  return ctx.json(getPostResponse.parse(post))
})

const deletePostResponse = selectPostSchema.pick({ id: true })

app.delete('/posts/:id', async (ctx) => {
  const post = await db
    .delete(posts)
    .where(eq(posts.id, +ctx.req.param('id')))
    .returning({ id: posts.id })
    .get()
  return ctx.json(deletePostResponse.parse(post))
})
