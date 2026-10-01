import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsernameOrEmail(username: string, email: string) {
    return this.userModel.findOne({
      $or: [{ username }, { email }],
    }).exec();
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    const user = new this.userModel(userData);
    return user.save();
  }
}