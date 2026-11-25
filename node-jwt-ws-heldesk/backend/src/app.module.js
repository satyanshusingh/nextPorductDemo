import { Module } from '@nestjs/common';
import { ApiController } from './api.controller.js';
import { HelpdeskApiService } from './helpdesk-api.service.js';

class AppModule {}

Module({
  controllers: [ApiController],
  providers: [HelpdeskApiService],
})(AppModule);

export { AppModule };
