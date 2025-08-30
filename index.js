import { Client, Account, Databases, Users, Permission, Role, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  
  const userId = req.headers['x-appwrite-user-id'] || '';
  
  const client = new Client()
     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
     .setKey(req.headers['x-appwrite-key'] ?? '');
  
  const users = new Users(client);
  const db = new Databases(client);

  log(req.body);
  if (req.path === "/") 
  { 
    const event = req.headers['x-appwrite-event'];
    //Consider changing this to whenever a new session is created, update that document
    if(event === "users." + req.body.$id + ".create")
    {
      try
      {
        const createDiscordUserDoc = await db.createDocument('669318d2002a5431ce91', '683661c0000023c9dd0b', req.body.$id, { discordUsername: req.body.name }, [ Permission.read(Role.user(req.body.$id)) ]);
        await users.updateName(
            req.body.$id,
            req.body.name
        );
      }
      catch(err)
      {
          error(err);
      }
    }
  }
  else if(req.path === "/create")
  {
    const body = JSON.parse(req.body);
    log(req);
    try
    {
      const getDiscordUserDoc = await db.getDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_USERS_COLLECTION_ID, userId);
      const createMessageDoc = await db.createDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_MESSAGES_COLLECTION_ID, ID.unique(), { folder: body.folder, message: body.message, seen: null, createdBy: getDiscordUserDoc.discordUsername  }, [ Permission.write(Role.user(userId))]);
    }
    catch(err)
    {
      error(err);
    }
  }
  
  return res.json({ status: "complete" });
};
