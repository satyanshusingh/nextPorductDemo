import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { HelpdeskApiService } from './helpdesk-api.service.js';

class ApiController {
  constructor(helpdeskApi) {
    this.helpdeskApi = helpdeskApi;
  }

  async dispatch(request, response) {
    const headers = {};
    for (const name of ['authorization', 'content-type']) {
      const value = request.get(name);
      if (value) headers[name] = value;
    }

    const payload = request.body === undefined
      ? undefined
      : JSON.stringify(request.body);
    const api = await this.helpdeskApi.getApi();
    const result = await api.inject({
      method: request.method,
      url: request.originalUrl,
      headers,
      payload,
    });

    response.status(result.statusCode);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader(
      'Content-Type',
      result.headers['content-type'] || 'application/json; charset=utf-8',
    );
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.send(result.body);
  }
}

Inject(HelpdeskApiService)(ApiController, undefined, 0);
Req()(ApiController.prototype, 'dispatch', 0);
Res()(ApiController.prototype, 'dispatch', 1);
All('*path')(
  ApiController.prototype,
  'dispatch',
  Object.getOwnPropertyDescriptor(ApiController.prototype, 'dispatch'),
);
Controller('api')(ApiController);

export { ApiController };
