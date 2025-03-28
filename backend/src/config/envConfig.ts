import { parseString, parseNumber } from '#src/utils/typeNarrowers';
import logger from '#src/utils/logger';
import dotenv from 'dotenv';

interface EnvVariables {
  PORT: number | undefined;
  DATABASE_URL: string;
  JWTACCESSTOKENEXPIRATION: number;
  JWTREFRESHTOKENEXPIRATION: number;
  JWTACCESSTOKENSECRET: string;
  JWTREFRESHTOKENSECRET: string;
}

const setDatabaseUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'test-node':
      return 'postgres://postgres:dbpassword@localhost:5432/postgres';
    case 'test-docker':
      return 'postgres://postgres:dbpassword@postgres:5432/postgres';
    case 'development':
      return process.env.DATABASE_URL;
    case 'production':
      return process.env.DATABASE_URL;
    default:
      return '';
  }
};

let envVariables: EnvVariables = {
  PORT: process.env.PORT ? parseNumber(Number(process.env.PORT)) : 3003,
  DATABASE_URL: process.env.DATABASE_URL ? parseString(setDatabaseUrl()) : '',
  JWTACCESSTOKENEXPIRATION: process.env.JWTACCESSTOKENEXPIRATION
    ? parseNumber(Number(process.env.JWTACCESSTOKENEXPIRATION))
    : 3600,
  JWTREFRESHTOKENEXPIRATION: process.env.JWTREFRESHTOKENEXPIRATION
    ? parseNumber(Number(process.env.JWTREFRESHTOKENEXPIRATION))
    : 86400,
  JWTACCESSTOKENSECRET: process.env.JWTACCESSTOKENSECRET
    ? parseString(process.env.JWTACCESSTOKENSECRET)
    : 'accesssecret',
  JWTREFRESHTOKENSECRET: process.env.JWTREFRESHTOKENSECRET
    ? parseString(process.env.JWTREFRESHTOKENSECRET)
    : 'refreshsecret'
};

const variableDefined = (variable: unknown): boolean => {
  return (
    variable !== undefined &&
    variable !== 'NaN' &&
    variable !== '' &&
    variable !== 0
  );
};

const allVariablesDefined: boolean = Object.values(envVariables).every(
  (variable) => variableDefined(variable)
);

const reassign = (): EnvVariables => {
  return {
    PORT: process.env.PORT ? parseNumber(Number(process.env.PORT)) : 3003,
    DATABASE_URL: process.env.DATABASE_URL ? parseString(setDatabaseUrl()) : '',
    JWTACCESSTOKENEXPIRATION: process.env.JWTACCESSTOKENEXPIRATION
      ? parseNumber(Number(process.env.JWTACCESSTOKENEXPIRATION))
      : 3600,
    JWTREFRESHTOKENEXPIRATION: process.env.JWTREFRESHTOKENEXPIRATION
      ? parseNumber(Number(process.env.JWTREFRESHTOKENEXPIRATION))
      : 86400,
    JWTACCESSTOKENSECRET: process.env.JWTACCESSTOKENSECRET
      ? parseString(process.env.JWTACCESSTOKENSECRET)
      : 'accesssecret',
    JWTREFRESHTOKENSECRET: process.env.JWTREFRESHTOKENSECRET
      ? parseString(process.env.JWTREFRESHTOKENSECRET)
      : 'refreshsecret'
  };
};

// Use dotenv to set environment variables if they aren't already defined and if not running in production
if (!allVariablesDefined) {
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    envVariables = reassign();
  }
}

for (const key of Object.keys(envVariables) as (keyof EnvVariables)[]) {
  if (!variableDefined(envVariables[key])) {
    logger(
      `Environment variable ${key} missing, exiting. Are you missing an .env file at project root or did you forget to set some variable?`
    );
    process.exit();
  }
}

logger('Environment variables:\n', JSON.stringify(envVariables, null, 2));

export default envVariables;
