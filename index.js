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
    if(event === "users." + req.body.$id + ".create")
    {
      try
      {
        const createDiscordUserDoc = await db.createDocument('669318d2002a5431ce91', '683661c0000023c9dd0b', req.body.$id, { discordUsername: req.body.name }, [ Permission.read(Role.user(req.body.$id)) ]);
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
    log(body);
    try
    {
      const getDiscordUserDoc = await db.getDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_USERS_COLLECTION_ID, userId);
      const createMessageDoc = await db.createDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_MESSAGES_COLLECTION_ID, ID.unique(), { folder: body.folder, message: body.message, seen: false, createdBy: getDiscordUserDoc.discordUsername  }, [ Permission.write(Role.user(userId))]);

      const getFoldersDoc = await db.listDocuments
      (
          process.env.APPWRITE_DATABASE_ID, 
          process.env.APPWRITE_FOLDERS_COLLECTION_ID, 
          [
              Query.equal("folder", [`${body.folder}`]),
              Query.limit(1)
          ]
      );
  
      if(getFoldersDoc.total > 0)
      {
        await db.updateDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_FOLDERS_COLLECTION_ID, getFoldersDoc.documents[0].$id,
          {
            folder: getFoldersDoc.documents[0].folder,
            seen: !getFoldersDoc.documents[0].seen,
          });
      }
      else
      {
        await db.createDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_FOLDERS_COLLECTION_ID, ID.unique(),
          {
            folder: body.folder,
            seen: false
          }
        );
      }
    
    
    }
    catch(err)
    {
      error(err);
    }
  }
  
  return res.json({ status: "complete" });
};
