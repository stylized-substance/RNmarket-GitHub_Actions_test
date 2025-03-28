import ProductSearchParameters from '#src/types/types';

// Extend Express Request object type with custom parameters

declare global {
  namespace Express {
    export interface Request {
      searchParameters: ProductSearchParameters;
      accessToken: string;
      verifiedToken: JwtPayload;
      isadmin: boolean;
    }
  }
}

export {};
