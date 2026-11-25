import { Injectable } from '@nestjs/common';
import { getHelpdeskApi } from '../server.js';

class HelpdeskApiService {
  async onModuleInit() {
    await getHelpdeskApi();
  }

  getApi() {
    return getHelpdeskApi();
  }
}

Injectable()(HelpdeskApiService);

export { HelpdeskApiService };
