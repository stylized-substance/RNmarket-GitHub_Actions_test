import { Request, Response, Router } from 'express';
import { User as UserModel } from '#src/models';
import { User, NewUser } from '#src/types/types';
import { toNewUser, parseString } from '#src/utils/typeNarrowers';
import tokenExtractor from '#src/middleware/tokenExtractor';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// Get users
router.get('/', tokenExtractor, async (req: Request, res: Response) => {
  // Allow only admin users to get users
  if (req.verifiedToken.isadmin === false) {
    return res.status(403).json({ Error: 'Only admin users can get users' });
  }

  const users: UserModel[] | [] = await UserModel.findAll({
    attributes: {
      exclude: ['passwordhash']
    }
  });

  return res.json({ users });
});

// Add user
router.post('/', tokenExtractor, async (req: Request, res: Response) => {
  const newUser: NewUser = toNewUser(req.body);

  // Allow only admin users to create admin users
  if (newUser.isadmin === true && req.verifiedToken.isadmin === false) {
    return res
      .status(403)
      .json({ Error: 'Only admin users can create admin users' });
  }

  const saltRounds: number = 12;
  const passwordHash: string = await bcrypt.hash(newUser.password, saltRounds);

  const userToAdd: User = {
    ...newUser,
    id: uuidv4(),
    passwordhash: passwordHash
  };

  const addedUser: UserModel = await UserModel.create({ ...userToAdd });
  return res.status(201).json({ addedUser });
});

// Change user password
router.put('/:id', tokenExtractor, async (req: Request, res: Response) => {
  const id: string = parseString(req.params.id);
  const user: UserModel | null = await UserModel.findByPk(id);
  if (user) {
    // Convert database response data to JSON
    const userJSON = user.toJSON();

    // Prevent users from changing each others passwords
    if (userJSON.id !== req.verifiedToken.id) {
      return res
        .status(403)
        .json({ Error: 'Users can only change their own password' });
    }

    const saltRounds: number = 12;
    const newPasswordHash: string = await bcrypt.hash(
      req.body.password,
      saltRounds
    );

    const userWithNewPassword: User = {
      ...userJSON,
      passwordhash: newPasswordHash
    };

    await user.update(userWithNewPassword);
    const saveResult: UserModel = await user.save();
    return res.json({ saveResult });
  } else {
    return res.status(404).json({ Error: 'User not found' });
  }
});

// Delete user
router.delete('/:id', tokenExtractor, async (req: Request, res: Response) => {
  // Allow only admin users to delete users
  if (req.verifiedToken.isadmin === false) {
    return res.status(403).json({ Error: 'Only admin users can delete users' });
  }

  const id: string = parseString(req.params.id);
  const user: UserModel | null = await UserModel.findByPk(id);

  if (user) {
    await user.destroy();
    return res.status(204).end();
  } else {
    return res.status(404).json({ Error: 'User not found' });
  }
});

export default router;
