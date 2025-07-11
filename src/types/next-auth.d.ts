import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      permissions: string[];
      restaurantId?: string;
      restaurantName?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
    permissions: string[];
    restaurantId?: string;
    restaurantName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    permissions?: string[];
    restaurantId?: string;
    restaurantName?: string;
  }
}