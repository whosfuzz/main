import { Client, TablesDB, Users, Permission, Role, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  
  const userId = req.headers['x-appwrite-user-id'] || '';
  
  const client = new Client()
     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
     .setKey(req.headers['x-appwrite-key'] ?? '');
  
  const users = new Users(client);
  const tablesDB = new TablesDB(client);

  async function getDiscordUser(accessToken) {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
    }
  
    return await response.json();
  }
  const body = JSON.parse(req.body);

  if (req.path === "/") 
  { 
    const event = req.headers['x-appwrite-event'];

    if(event === "users." + userId + ".sessions." + req.body.$id + ".create")
    {
      try
      {
        const user = await getDiscordUser(req.body.providerAccessToken);
        
        const upsertDiscordUserDoc = await tablesDB.upsertRow({
          databaseId: '669318d2002a5431ce91',
          tableId: '683661c0000023c9dd0b',
          rowId: req.body.$id,
          data: {
            discordUsername: user.username
          }, 
          permissions: [
            Permission.read(Role.user(userId))
          ]
        });
        const updateName = await users.updateName({
            userId: userId,
            name: user.username
        });
      }
      catch(err)
      {
        error(err);
      }
    }
  }
  else if(req.path === "/createFolder")
  {
    try
    {
      const getDiscordUserDoc = await tablesDB.getRow({
        databaseId: '669318d2002a5431ce91',
        tableId: '683661c0000023c9dd0b',
        rowId: userId
      });

      const createFolderDoc = await tablesDB.createRow({
        databaseId: '669318d2002a5431ce91',
        tableId: '68b28927000dbf87a0aa',
        rowId: ID.unique(),
        data: {
          folder: body.folder, weekday: body.weekday, seen: null
        },
        permissions: [ Permission.write(Role.user(userId))]
      });
    }
    catch(err)
    {
      error(err);
    }
  }
  else if(req.path === "/create")
  {
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
        permissions:
        [
          Permission.write(Role.user(userId))
        ]
      });
    }
    catch(err)
    {
      error(err);
    }
  }
  
  return res.json({ status: "complete" });
};
