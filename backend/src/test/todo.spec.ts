import { FastifyInstance } from 'fastify'
import { startFastify } from '../server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as dbHandler from './db'
import * as E from 'fp-ts/Either'
import { ITodo } from '../types/todo'
import { constTrue } from 'fp-ts/lib/function'

describe('Form test', () => {
    let server: FastifyInstance<Server, IncomingMessage, ServerResponse>

    beforeAll(async () => {
        await dbHandler.connect()
        server = startFastify(8888)
    })

    afterEach(async () => {
        await dbHandler.clearDatabase()
    })

    afterAll(async () => {
        E.match(
            (e) => console.log(e),
            (_) => console.log('Closing Fastify server is done!')
        )(
            E.tryCatch(
                () => {
                    dbHandler.closeDatabase()
                    server.close((): void => { })
                },
                (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
            )
        )
    })

    // TODO: Add some test cases like CRUD, i.e. get, post, update, delete
    it("should get all todos", async () => {
        const response = await server.inject({ method: 'GET', url: '/api/todos' })
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual(JSON.stringify({ todos: [] }))
    })

    it("should add a todo item", async () => {
        const response = await server.inject({
            method: 'POST', url: '/api/todos', payload: {
                name: "test_todo",
                description: "this is a test todo.",
                status: false
            }
        })
        const testTodo : ITodo = JSON.parse(response.body)
        const response2 = await server.inject({
            method: 'GET', url: '/api/todos'
        })
        expect(response.statusCode).toBe(200)
        expect(response2.statusCode).toBe(200)
        const todos : Array<ITodo> = JSON.parse(response2.body).todos
        expect(todos.length).toBe(1)
        const updatedTodo : ITodo = todos[0]
        expect(updatedTodo._id).toBe(testTodo._id)
        expect(updatedTodo.name).toBe(testTodo.name)
        expect(updatedTodo.description).toBe(testTodo.description)
        expect(updatedTodo.status).toBe(testTodo.status)
    })

    it("should add a todo item", async () => {
        const response = await server.inject({
            method: 'POST', url: '/api/todos', payload: {
                name: "test_todo",
                description: "this is a test todo.",
                status: false
            }
        })
        const testTodo: ITodo = JSON.parse(response.body)
        const response2 = await server.inject({
            method: 'GET', url: '/api/todos'
        })
        const todos : Array<ITodo> = JSON.parse(response2.body).todos
        const originalTodo: ITodo = todos[0]
        expect(originalTodo._id).toBe(testTodo._id)
        expect(originalTodo.name).toBe(testTodo.name)
        expect(originalTodo.description).toBe(testTodo.description)
        expect(originalTodo.status).toBe(testTodo.status)
        const response3 = await server.inject({
            method: 'PUT', url: `/api/todos/${testTodo._id}`, payload: {
                name: 'modified_test_todo',
                description: 'this is a modified test todo.',
                status: true
            }
        })
        const response4 = await server.inject({
            method: 'GET', url: '/api/todos'
        })
        const todos2 : Array<ITodo> = JSON.parse(response4.body).todos
        const modifiedTodo: ITodo = todos2[0]
        expect(modifiedTodo._id).toBe(testTodo._id)
        expect(modifiedTodo.name).toBe('modified_test_todo')
        expect(modifiedTodo.description).toBe('this is a modified test todo.')
        expect(modifiedTodo.status).toBe(true)
    })

    it("should delete a todo item", async () => {
        const response = await server.inject({
            method: 'POST', url: '/api/todos', payload: {
                name: "test_todo",
                description: "this is a test todo.",
                status: false
            }
        })
        expect(response.statusCode).toBe(200)
        const testTodo : ITodo = JSON.parse(response.body)

        const response2 = await server.inject({ method: 'GET', url: '/api/todos' })
        expect(response2.statusCode).toBe(200)
        expect(JSON.parse(response2.body).todos.length).toBe(1)

        const response3 = await server.inject({
            method: 'DELETE', url: `/api/todos/${testTodo._id}`
        })
        expect(response3.statusCode).toBe(200)

        const response4 = await server.inject({ method: 'GET', url: '/api/todos' })
        expect(response4.statusCode).toBe(200)
        expect(response4.body).toStrictEqual(JSON.stringify({ todos: [] }))
    })
})
