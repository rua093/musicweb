import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('api/v1/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() data: { to: string; subject: string; template: string; context: any }) {
    return this.mailService.sendMail(data.to, data.subject, data.template, data.context);
  }
} 