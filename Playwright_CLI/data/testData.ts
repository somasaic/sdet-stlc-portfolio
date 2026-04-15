export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface UserPayload {
  name: string;
  job: string;
}

export const apiData = {
  validLogin: {
    email: 'eve.holt@reqres.in',
    password: 'cityslicka',
  } as LoginCredentials,

  invalidLogin: {
    email: 'wrong@test.com',
    password: 'wrongpassword',
  } as LoginCredentials,

  missingPassword: {
    email: 'eve.holt@reqres.in',
  } as LoginCredentials,

  validRegister: {
    email: 'eve.holt@reqres.in',
    password: 'pistol',
  } as LoginCredentials,

  missingPasswordRegister: {
    email: 'sydney@fife',
  } as LoginCredentials,

  updateUser: {
    name: 'Soma Sai',
    job: 'SDET',
  } as UserPayload,
};

export const uiData = {
  validEmail: 'test@wingify.com',
  validPassword: 'Test@1234',
  invalidEmail: 'invalid@test.com',
  invalidPassword: 'wrongpassword123',
  emptyString: '',
};

export const endpoints = {
  login: '/api/login',
  register: '/api/register',
  users: '/api/users',
  singleUser: '/api/users/2',
  nonExistentUser: '/api/users/23',
};