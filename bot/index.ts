import { LynxClient } from "./client/client.ts"
import "dotenv/config"


const client = new LynxClient()
client.login()


export default client