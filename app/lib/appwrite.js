import { Client, Account, TablesDB } from "appwrite";
import { redirect } from "next/navigation";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export { ID } from "appwrite";

export const getUser = async function getUser(
  idFunc,
  nameFunc,
  routeFunc,
  page
) {
  try {
    const user = await account.get();
    nameFunc ? nameFunc(user.name) : null;
    idFunc ? idFunc(user.$id) : null;
    if (routeFunc) routeFunc("success");
  } catch {
    if (routeFunc) routeFunc("fail");
    if (page !== "auth") {
      redirect("/authentication");
    }
  }
};
