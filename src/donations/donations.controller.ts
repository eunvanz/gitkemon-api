import { Controller, ForbiddenException, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/constants/cookies';
import { DonationsService } from './donations.service';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationService: DonationsService) {}

  @Post()
  async save(@Req() req: Request) {
    const accessToken = req.headers[ACCESS_TOKEN_COOKIE_NAME];
    if (!accessToken) {
      throw new ForbiddenException();
    } else {
      await this.donationService.save(accessToken as string);
    }
  }
}
