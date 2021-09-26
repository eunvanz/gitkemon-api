import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { Roles } from 'src/decorators/roles.decorators';
import { ValidateTokenGuard } from 'src/guards/validate-token.guards';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { PaybacksService } from './paybacks.service';

@UseInterceptors(SentryInterceptor)
@Controller('paybacks')
export class PaybacksController {
  constructor(private readonly paybackService: PaybacksService) {}

  @Post()
  @UseGuards(ValidateTokenGuard)
  async save(@Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string) {
    return await this.paybackService.save(accessToken as string);
  }

  @Get('history/:userId')
  async getDailyHistory(@Param('userId') userId: string) {
    return await this.paybackService.getDailyHistory(userId);
  }

  @Get('last')
  @UseGuards(ValidateTokenGuard)
  async findLastPayback(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    return await this.paybackService.findLastPayback(accessToken);
  }

  // TODO: 실제 배포시 주석처리
  // @Post('reset/:userId')
  // @Roles('admin')
  // async reset(@Param('userId') userId: string) {
  //   return await this.paybackService.reset(userId);
  // }
}
