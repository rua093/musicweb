import { Controller, Post, Body, UseGuards, Request, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../decorator/customize';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SocialMediaDto } from './dto/social-media.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, description: 'Login successful' })
  async login(@Request() req, @Res() res: Response) {
    const loginResult = await this.authService.login(req.user);
    const user = loginResult.user;
    const mappedUser = {
      _id: user.id?.toString() ?? '',
      username: user.username ?? '',
      email: user.email,
      address: user.address ?? '',
      isVerify: user.is_verify ?? false,
      type: user.type ?? 'SYSTEM',
      name: user.name ?? '',
      role: user.role ?? '',
      gender: user.gender ?? '',
      age: user.age ?? null,
    };
    // Set refresh token in cookie
    res.cookie('refresh_token', loginResult.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(201).json({
      statusCode: 201,
      message: 'User Login',
      data: {
        access_token: loginResult.access_token,
        refresh_token: loginResult.refresh_token, // Thêm lại refresh_token vào response
        user: mappedUser,
      },
    });
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto, true) as import('../users/schemas/user.entity').User;
    return {
      statusCode: 201,
      message: 'Register a new user',
      data: {
        _id: user.id?.toString() ?? '',
        createdAt: user.created_at?.toISOString() ?? '',
      },
    };
  }

  @Get('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user account' })
  @ApiResponse({ status: 200, description: 'Get account successful' })
  async getAccount(@Request() req) {
    const userData = await this.authService.getAccount(req.user);
    return {
      statusCode: 200,
      message: 'Get user information',
      data: {
        user: {
          _id: userData.id?.toString() ?? '',
          email: userData.email,
          address: userData.address ?? '',
          isVerify: userData.is_verify ?? false,
          name: userData.name ?? '',
          role: userData.role ?? '',
        }
      }
    };
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successful' })
  async refresh(@Request() req, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Refresh token not found',
      });
    }
    const result = await this.authService.refresh(refreshToken);
    // Set new refresh token in cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Map lại user cho đúng format
    const user = result.user;
    const mappedUser = {
      _id: user.id?.toString() ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      address: user.address ?? '',
      isVerify: user.is_verify ?? false,
      name: user.name ?? '',
      role: user.role ?? '',
      gender: user.gender ?? '',
      age: user.age ?? null,
    };
    return res.status(201).json({
      statusCode: 201,
      message: 'Get User by refresh token',
      data: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        user: mappedUser,
      },
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req, @Res() res: Response) {
    // Xoá cookie refresh_token
    res.clearCookie('refresh_token');
    return res.status(201).json({
      statusCode: 201,
      message: 'Logout User',
      data: 'ok',
    });
  }

  @Post('social-media')
  @Public()
  @ApiOperation({ summary: 'Get token by social media' })
  @ApiResponse({ status: 201, description: 'Social media login successful' })
  async socialMedia(@Body() socialMediaDto: SocialMediaDto, @Res() res: Response) {
    const result = await this.authService.socialMedia(socialMediaDto.type, socialMediaDto.username);
    // Map lại user đúng format
    const user = result.user;
    const mappedUser = {
      _id: user.id?.toString() ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      isVerify: user.is_verify ?? false,
      type: user.type ?? socialMediaDto.type,
      role: user.role ?? 'USER',
    };
    return res.status(201).json({
      statusCode: 201,
      message: 'Fetch tokens for user login with social media account',
      data: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        user: mappedUser,
      },
    });
  }
} 