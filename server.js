const { Server } = require('net')

// host
const host = '0.0.0.0'

// Key to close a socket
const END = 'END'

const connections = new Map();


// error function
const error = (message) => {
    console.error(message);
    process.exit(1)
};

const sendMessage = (message, origin) => {
    // Send to all users but origin user
    for (const socket of connections.keys()) {
        if (socket !== origin) {
            socket.write(message);
        }
    }


}

// listen
const listen = (port) => {
    const server = new Server();

    server.on("connection", (socket) => {
        const remoteSocket = `${socket.remoteAddress}: ${socket.remotePort}`

        socket.setEncoding('utf-8')
        socket.on('data', (message) => {
            if (!connections.has(socket)) {
                let log = true;
                for (const username of connections.values()) {
                    if (username == message) {
                        socket.write(`Username [${message}] already exist, try again with other one`);
                        socket.end();
                        log = false;
                        break;
                    } else {
                        log = true
                    }
                }
                if (log) {
                    console.log(`New connection from ${remoteSocket} as [${message}]`);
                    connections.set(socket, message);
                }
            } else if (message === END) {
                console.log(`Connection with ${connections.get(socket)} closed`);
                socket.end();
            } else {
                const fullMessage = `[${connections.get(socket)}]: ${ message }`;
                console.log(`${ remoteSocket } -> ${ fullMessage }`);
                sendMessage(fullMessage, socket);
            }
        })
        socket.on('close', () => {
            connections.delete(socket);
        })
        socket.on('error', (err) => error(err.message))
    })

    server.listen({ port, host }, () => {
        console.log('Listening on port 8000')
    })

    server.on('error', (err) => error(err.message));
}

// Main function
const main = () => {
    if (process.argv.length !== 3) {
        error(`usage: node server.js port`)
    }

    let port = process.argv[2]

    // Port is a number
    if (isNaN(port)) {
        error(`Invalid port: ${port}`)
    }

    port = Number(port)
    listen(port)
}

// Execute main
if (require.main === module) {
    main();
}