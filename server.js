const {createServer} = require("http");

function requestHandler(req, res){
    res.writeHead(200, {'Content-type': 'application/json'});

   
}

const server = createServer(requestHandler);
server.listen(3000,)