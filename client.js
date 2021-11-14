const { Socket } = require("net");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

const END = "END";

const socket = new Socket();

// error function
const error = (message) => {
    console.error(message);
    process.exit(1);
};

const connect = (host, port) => {
    socket.connect({ host, port });
    socket.setEncoding("utf-8");

    socket.on("connect", () => {
        console.log(`-CONNECTED TO ${host}:${port}-`)

        // Login
        readline.question(`Choose you username: `, (userName) => {
            socket.write(userName);
            console.log(`Type any message to send it, type ${END} to finish`)
        });

        readline.on("line", (message) => {
            socket.write(message);
            if (message === END) {
                socket.end();
            }
        });

        socket.on("data", (data) => {
            console.log(data);
        });


        socket.on("close", () => {
            console.log(`-DISCONNECTED-`);
            process.exit(0);
        });
    });


    socket.on("error", (err) => console.error(err));
};

const main = () => {
    if (process.argv.length !== 4) {
        error(`usage: node server.js host port username`);
    }

    let [, , host, port] = process.argv;

    // Port is a number
    if (isNaN(port)) {
        error(`Invalid port: ${port}`);
    }

    port = Number(port);

    connect(host, port);
};

// Execute main
if (require.main === module) {
    main();
}