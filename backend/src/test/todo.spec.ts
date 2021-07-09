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
        const response2 = await server.inject({
            method: 'GET', url: '/api/todos'
        })
        expect(response.statusCode).toBe(200)
        expect(response2.statusCode).toBe(200)
        expect(response2.body).toStrictEqual(JSON.stringify({
            todos: [
                JSON.parse(response.body)
            ]
        }))
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
        expect(response.statusCode).toBe(200)

        const response2 = await server.inject({
            method: 'GET', url: '/api/todos'
        })
        // expect(response.body).toBe("")
        expect(response2.statusCode).toBe(200)
        expect(response2.body).toStrictEqual(JSON.stringify({
            todos: [
                testTodo
            ]
        }))
        const response3 = await server.inject({
            method: 'PUT', url: `/api/todos:id=${testTodo._id}`, payload: {
                name: 'modified_test_todo',
                description: 'this is a modified test todo.',
                status: true
            }
        })
        const modifiedTodo : ITodo = JSON.parse(response3.body)
        expect(modifiedTodo).toStrictEqual({
            _id: testTodo._id,
            name: 'modified_test_todo',
            description: 'this is a modified test todo.',
            status: true
        })
        // expect(modifiedTodo._id).toBe(testTodo._id)
        // // expect(modifiedTodo).toBe("3")
        // expect(modifiedTodo.name).toBe('modified_test_todo')
        // expect(modifiedTodo.description).toBe('this is a modified test todo.')
        // expect(modifiedTodo.status).toBe(true)
        // 
        expect(response3.body).toStrictEqual(JSON.stringify({
            todos: [
                modifiedTodo
            ]
        }))
    })


})
