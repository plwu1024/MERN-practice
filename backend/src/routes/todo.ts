import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { ITodo } from '../types/todo'
import { TodoRepoImpl } from './../repo/todo-repo'

const TodoRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {

    const todoRepo = TodoRepoImpl.of()

    interface IdParam {
        id: string
    }

    // TODO: Add CRUD endpoints, i.e. get, post, update, delete
    // NOTE: the url should be RESTful
    server.get('/todos', opts, async (request, reply) => {
        try {
            const todos: Array<ITodo> = await todoRepo.getTodos()
            return reply.status(200).send({ todos })
        } catch (error) {
            console.error(`GET /todos Error: ${error}`)
            return reply.status(500).send(`[server error]: ${error}`)
        }
    })

    server.post('/todos', opts, async (request, reply) => {
        try {
            const todoIn: ITodo = request.body as ITodo
            const todoOut: ITodo = await todoRepo.addTodo(todoIn)
            return reply.status(200).send(todoOut)
        } catch (error) {
            console.error(`GET /todos Error: ${error}`)
            return reply.status(500).send(`[server error]: ${error}`)
        }
    })
    server.put<{ Params: IdParam }>('/todos/:id', opts, async (request, reply) => {
        try {
            const id = request.params.id
            const todoIn: ITodo = request.body as ITodo
            const todoOut: ITodo | null = await todoRepo.updateTodo(id, todoIn)
            if (todoOut === null) {
                console.error(`PUT /todos Error: todo not found`)
                return reply.status(404).send(todoOut)
            }
            return reply.status(200).send(todoOut)
        } catch (error) {
            console.error(`PUT /todos Error: ${error}`)
            return reply.status(500).send(`[server error]: ${error}`)
        }
    })
    server.delete<{ Params: IdParam }>('/todos/:id', opts, async (request, reply) => {
        try {
            const id = request.params.id
            const todoOut: ITodo | null = await todoRepo.deleteTodo(id)
            if (todoOut) {
                return reply.status(200).send(todoOut)
            }
            console.error(`PUT /todos Error: todo not found`)
            return reply.status(404).send(todoOut)
        } catch (error) {
            console.error(`PUT /todos Error: ${error}`)
            return reply.status(500).send(`[server error]: ${error}`)
        }
    })

    done()
}

export { TodoRouter }
