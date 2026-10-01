import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../schemas/user.schema.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly jwtService: JwtService,
  ) {}

  // ==================== SIGNUP ====================
  async signup(signupDto: SignupDto) {
    const {
      username,
      email,
      password,
      confirmPassword,
    } = signupDto;

    // 1. Check required fields
    if (!username || !email || !password || !confirmPassword) {
      throw new BadRequestException(
        'All fields are required',
      );
    }

    // 2. Check password length
    if (password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters',
      );
    }

    // 3. Check password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    // 4. Normalize input
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 5. Check if username or email already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'Username or email already registered',
      );
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    // 7. Create user
    const user = await this.userModel.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    // 8. Return safe user information
    return {
      message: 'Signup successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  // ==================== LOGIN ====================
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Check required fields
    if (!email || !password) {
      throw new BadRequestException(
        'Email and password are required',
      );
    }

    // 2. Find user by email
    const cleanEmail = email.trim().toLowerCase();

    const user = await this.userModel.findOne({
      email: cleanEmail,
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // 3. Compare password with hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // 4. Generate JWT token
    const token = await this.jwtService.signAsync({
      sub: user._id.toString(),
      email: user.email,
    });

    // 5. Return token and user information
    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }
}