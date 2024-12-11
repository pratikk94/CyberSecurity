import { AppService } from 'src/services/app.services';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
}
