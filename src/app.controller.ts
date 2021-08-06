import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService,private _jwtService: JwtService) {}

  @Post('register')
  async register(@Body('name') name, @Body('email') email, @Body('password') password) {
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.appService.register({
      name,
      email,
      password: hashedPassword
    });
  }

  @Post('login')
  async login(@Body('email') email, @Body('password') password, @Res({passthrough: true}) response: Response) {
    const user = await this.appService.findOne({email});
    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }

    if(! await bcrypt.compare(password, user.password)) {
      throw new BadRequestException('Invalid Credentials');
    }

    const jwt = await this._jwtService.signAsync({id: user.id, email: user.email})

    response.cookie('jwt',jwt, {httpOnly: true})

    return {
      msg: 'Logged In',
    };
  }

  @Get('user')
  async getUser(@Req() request: Request) {
    try {
      const jwt = request.cookies['jwt'];

      const data = await this._jwtService.verifyAsync(jwt);
      
      if(!data) {
        throw new UnauthorizedException();
      }

      const user = await  this.appService.findOne({id: data.id});

      const {password, ...result} = user;

      return result

    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }

  @Post('logout')
  async logout(@Res({passthrough: true}) response: Response) {
    response.clearCookie('jwt');

    return {
      msg: 'Logged Out'
    };
  }
}
