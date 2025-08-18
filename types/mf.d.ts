declare module 'host/cartApi' {
  import type { CartApi } from '@mfe/contracts';
  const cartApi: CartApi;
  export default cartApi;
  export { cartApi };
}

declare module 'host/authApi' {
  import type { AuthApi } from '@mfe/contracts';
  const authApi: AuthApi;
  export default authApi;
  export { authApi };
}
