const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const uuid = require('uuid');

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port)
server.listen(port, (err) => {
  if (err) {
    return console.log('Error occured:', error);
  }
  console.log(`server is listening on ${port}`);
});
//http.createServer(app.callback()).listen(port)

app.use(
  koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  })
);

app.use(koaCors());

let tickets = [];

//GET
app.use(async (ctx, next) => {
  if (ctx.request.method !== 'GET' || !ctx.request.url.startsWith('/tickets')) {
    next();
    return;
  }

  try {
    const { method, id } = ctx.query;

    switch (method) {
      case 'allTickets':
        ctx.response.body = tickets.map(({ description, ...rest }) => rest);
        break;
      case 'ticketById':
        const foundTicket = tickets.find((el) => el.id == id);
        if (foundTicket) {
          ctx.response.body = foundTicket;
        }
        break;
    }
  } catch (error) {
    ctx.response.status = 500;
    return;
  }
});

//DELETE
app.use(async (ctx, next) => {
  if (ctx.request.method !== 'DELETE' || !ctx.request.url.startsWith('/tickets')) {
    next();
    return;
  }

  try {
    const { method, id } = ctx.query;

    if (method === 'deleteById') {
      tickets = tickets.filter((el) => el.id != id);
      ctx.response.status = 204;
    }
  } catch (error) {
    ctx.response.status = 500;
    return;
  }
});

//POST
app.use(async (ctx, next) => {
  if (ctx.request.method !== 'POST' || !ctx.request.url.startsWith('/tickets')) {
    next();
    return;
  }

  try {
    const { method } = ctx.query;

    if (method === 'createTicket') {
      const { body } = ctx.request;

      body.id = uuid.v4();
      body.status = false;
      body.created = Date.now();

      tickets.push(body);
      ctx.response.body = body;
    }
  } catch (error) {
    ctx.response.status = 500;
    return;
  }
});

//PUT
app.use(async (ctx, next) => {
  if (ctx.request.method !== 'PUT' || !ctx.request.url.startsWith('/tickets')) {
    next();
    return;
  }

  try {
    const { method, id } = ctx.query;

    if (method === 'updateById') {
      const { body } = ctx.request;

      const idx = tickets.findIndex((el) => el.id == id);

      if (idx < 0) {
        return;
      }

      tickets[idx].name = body.hasOwnProperty('name') ? body.name : tickets[idx].name;
      tickets[idx].status = body.hasOwnProperty('status') ? body.status : tickets[idx].status;
      tickets[idx].description = body.hasOwnProperty('description') ? body.description : tickets[idx].description;

      ctx.response.body = tickets[idx];
    }
  } catch (error) {
    ctx.response.status = 500;
    return;
  }
});

module.exports = app;
