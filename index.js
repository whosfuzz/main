import { Client, TablesDB, Users, Permission, Role, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  
  const userId = req.headers['x-appwrite-user-id'] || '';
  
  const client = new Client()
     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
     .setKey(req.headers['x-appwrite-key'] ?? '');
  
  const users = new Users(client);
  const tablesDB = new TablesDB(client);

  if (req.path === "/") 
  { 
    const event = req.headers['x-appwrite-event'];

    if(event === "users." + userId + ".sessions." + req.body.$id + ".create")
    {
      try
      {
        log(userId);
        log(req.body.$id);
        log(req.body);
        const upsertDiscordUserDoc = await tablesDB.upsertRow({
          databaseId: '669318d2002a5431ce91',
          tableId: '683661c0000023c9dd0b',
          rowId: req.body.$id,
          data: {
            discordUsername: req.body.name
          }, 
          permissions: [
            Permission.read(Role.user(userId))
          ]
        });
        const updateName = await users.updateName({
            userId: userId,
            name: req.body.name
        });
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
      const getDiscordUserDoc = await tablesDB.getRow({
        databaseId: '669318d2002a5431ce91',
        tableId: '683661c0000023c9dd0b',
        rowId: userId
      });

      const createMessageDoc = await tablesDB.createRow({
        databaseId: '669318d2002a5431ce91',
        tableId: '6695461400342d012490',
        rowId: ID.unique(),
        data: {
          folder: body.folder, message: body.message, seen: null, createdBy: getDiscordUserDoc.discordUsername
        },
        permissions: [ Permission.write(Role.user(userId))]
      });
    }
    catch(err)
    {
      error(err);
    }
  }
  
  return res.json({ status: "complete" });
};
