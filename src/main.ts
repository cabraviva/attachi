#! /usr/bin/env node
import chalk from 'chalk'
import express from 'express'
import open from 'open'
import { join } from 'path'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express()
const ui = express()
const http = createServer(app)
const io = new Server(http)

app.use(express.static(join(__dirname, 'ui', 'lib')))
ui.use(express.static(join(__dirname, 'ui', 'app')))

let connected: string[] = []
io.on('connection', (socket) => {
    const pushindex = connected.push(socket.id) - 1
    socket.on('a-exec-code', (to: string, code: string, cb: Function) => {
        io.to(to).emit('l-exec-code', code, cb)
    })
    socket.on('disconnect', () => {
        connected = connected.filter((_, i) => i !== pushindex)
    })
})

http.listen(9608, () => {
    console.log(chalk.cyan(`Attachi running on http://localhost:9608`))
    ui.listen(9607, () => {
        console.log(chalk.cyan(`UI running on http://localhost:9607`))
        open('http://localhost:9607')
    })
})