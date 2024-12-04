import { getOne, insertSingleRow } from '~/database/query';
import bcrypt from 'bcryptjs';
import { generateAccessJWT } from '~/utilities/generateAccessToken';
import { v4 as uuidv4 } from 'uuid';

const createUser = async (data) => {
  const { email, password, confirmPassword, name, phone } = data;

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isValidEmail(email)) {
    return { status: false, message: 'Invalid email' };
  }

  const existingUser = await getOne('users', 'email', email);

  if (existingUser.length > 0) {
    return { status: false, message: 'Email has been used.' };
  }

  const isValidPhone = (phone) => {
    const phoneRegex = /^(?:\+84|0)(3|5|7|8|9)\d{8}$/;
    return phoneRegex.test(phone);
  };

  if (!isValidPhone(phone)) {
    return { status: false, message: 'Invalid phone number format.' };
  }

  const existingUserByPhone = await getOne('users', phone, 'phone_number');
  if (existingUserByPhone.length > 0) {
    return { status: false, message: 'Phone number has been used.' };
  }

  if (password != confirmPassword) {
    return { status: false, message: 'Your confirmation password is not correct.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await insertSingleRow('users', { id: uuidv4(), email: email, password: hashedPassword, name: name, phone_number: phone });

  return { status: true, message: 'Create new user successfully!' };
};

const logout = async (req, res) => {
  res.clearCookie('SessionID', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });

  res.json({ message: 'You have been logged out.' });
};

const login = async (data, res) => {
  const { email, password } = data;

  const user = await getOne('users', 'email', email);

  if (user.length > 0) {
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return { status: false, message: 'Your password is not correct' };
    }

    let options = {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    };

    const token = generateAccessJWT(user[0].id);

    res.cookie('SessionID', token, options);
    return {
      status: true,
      role: user[0].role,
      token: token,
      message: 'You have successfully logged in.'
    };

  } else {
    return { status: false, message: 'Your email is not correct' };
  }

};

export const AuthModel = {
  createUser,
  login,
  logout
};