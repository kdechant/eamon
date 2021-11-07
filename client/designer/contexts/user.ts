import * as React from "react";

interface UserContextInterface {
  username: string,
  token: string,
  changeUserState: (username: string, token: string, refresh_token: string) => void,
  getToken: () => Promise<string>,
}
const UserContext = React.createContext<UserContextInterface | null>(null);

export default UserContext;
