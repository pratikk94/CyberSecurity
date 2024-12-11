"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const peer_server_1 = require("./peer-server");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const port = 3001;
    await app.listen(port);
    console.log(`NestJS server is running on http://localhost:${port}`);
    const peerJsGateway = new peer_server_1.PeerJsGateway();
    peerJsGateway.start();
}
bootstrap();
//# sourceMappingURL=main.js.map