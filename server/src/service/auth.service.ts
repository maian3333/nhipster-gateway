import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Authority } from '../domain/authority.entity';
import { UserService } from '../service/user.service';
import { UserDTO } from './dto/user.dto';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @InjectRepository(Authority) private authorityRepository: Repository<Authority>,
    private userService: UserService,
  ) {}

  async findUserOrSave(loginUser: UserDTO): Promise<UserDTO | undefined> {
    if (loginUser.login && loginUser.password && !loginUser.email) {
      loginUser.email = `${loginUser.login}@localhost.it`;
    }
    let userFound: UserDTO = await this.userService.findByFields({ where: { login: loginUser.login } });

    if (!userFound) {
      const authoritiesName = [];
      loginUser.authorities.forEach(authority => authoritiesName.push({ name: authority }));
      userFound = { ...loginUser };
      userFound.authorities = authoritiesName;
      await this.userService.save(userFound, loginUser.login);
    }
    return loginUser;
  }

  getAccount(userDTO: UserDTO): any {
    if (!userDTO) {
      return;
    }
    return userDTO;
  }

  async getAllUsers(options: FindManyOptions<UserDTO>): Promise<[UserDTO[], number]> {
    return await this.userService.findAndCount(options);
  }
}
