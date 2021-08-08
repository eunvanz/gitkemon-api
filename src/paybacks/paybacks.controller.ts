import { Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { PaybacksService } from './paybacks.service';

@Controller('paybacks')
export class PaybacksController {
  constructor(private readonly paybackService: PaybacksService) {}

  @Post()
  async save(@Headers(ACCESS_TOKEN_HEADER_NAME) accessToken?: string) {
    if (!accessToken) {
      throw new ForbiddenException();
    }
    return await this.paybackService.save(accessToken as string);
  }
}
