import { Client, Account, Databases, Users, Permission, Role, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  
  const userId = req.headers['x-appwrite-user-id'];
  
  const client = new Client()
     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
     .setKey(req.headers['x-appwrite-key'] ?? '');
  
  const users = new Users(client);
  const db = new Databases(client);

  const user = await users.get(userId);

  if (req.path === "/") 
  { 
    const event = req.headers['x-appwrite-event'];
    if(event === "users." + req.body.userId + ".create")
    {
      const createDiscordUserDoc = await db.createDocument('669318d2002a5431ce91', '683661c0000023c9dd0b', req.body.userId, { discordUsername: req.body.name }, [ Permission.read(Role.user(req.body.userId)) ]);
    }
  }
  else if(req.path === "/create")
  {
    const createMessageDoc = await db.createDocument('669318d2002a5431ce91', '6695461400342d012490', ID.unique(), { folder: req.body.folder, message: req.body.message, seen: false, discordUsername: userId }, [ Permission.read(Role.user(userId)), Permission.write(Role.user(userId))]);
  }
  
  return res.json({ status: "complete" });
};
