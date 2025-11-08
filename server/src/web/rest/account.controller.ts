/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClassSerializerInterceptor, Controller, Get, Logger, Req, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDTO } from '../../service/dto/user.dto';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { AuthService } from '../../service/auth.service';

@Controller('api')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiTags('account-resource')
export class AccountController {
  logger = new Logger('AccountController');

  constructor(private readonly authService: AuthService) {}

  @Get('/account')
  @ApiOperation({ summary: 'Get the current user if logged' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved',
    type: UserDTO,
  })
  getAccount(@Req() req: any): any {
    if (!req.session) {
      return;
    }
    const userDTO: UserDTO = req.session.user;
    return this.authService.getAccount(userDTO);
  }
}
