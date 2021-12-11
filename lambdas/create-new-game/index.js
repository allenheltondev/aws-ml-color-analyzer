const ULID = require('ulid');
const { StatusCodes } = require('http-status-codes');
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const game = exports.mapGameDetails(body);

    await exports.saveGame(game);
    return {
      statusCode: StatusCodes.CREATED,
      body: JSON.stringify({ id: game.pk }),
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  catch (err) {
    console.error(err);
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ message: 'Something went wrong' }),
      headers: {
        'content-type': 'application/json'
      }
    };
  }
};

exports.mapGameDetails = (input) => {
  const id = ULID.ulid();
  const game = {
    pk: id,
    sk: 'game#',
    answer: input.answer,
    status: 'active',
    createdDate: new Date(ULID.decodeTime(id)).toISOString(),
    ...input.name && { name: input.name }
  };

  return game;
};

exports.saveGame = async (game) => {
  const params = exports.buildSaveGameParams(game);
  await ddb.send(new PutItemCommand(params));
};

exports.buildSaveGameParams = (game) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: marshall(game)
  };

  return params;
};