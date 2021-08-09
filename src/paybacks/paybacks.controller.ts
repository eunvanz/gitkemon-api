import {
  Controller,
  ForbiddenException,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
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

  // TODO: 실제 배포시 주석처리
  @Post('reset/:userId')
  async reset(@Param('userId') userId: string) {
    return await this.paybackService.reset(userId);
  }
}
