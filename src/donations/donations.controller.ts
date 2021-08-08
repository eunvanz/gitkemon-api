import { Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { DonationsService } from './donations.service';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationService: DonationsService) {}

  @Post()
  async save(@Headers(ACCESS_TOKEN_HEADER_NAME) accessToken?: string) {
    if (!accessToken) {
      throw new ForbiddenException();
    } else {
      await this.donationService.save(accessToken as string);
    }
  }
}
