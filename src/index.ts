import HyperExpress from "hyper-express";
import cors from "cors";
import { therapistRouter } from "./routes/therapist";
import { WebSocket } from "ws";
import ReconnectingWebSocket from "reconnecting-websocket";
import { PrismaClient } from "@prisma/client";
import { SMSMessage } from "./types";
import { internalRouter } from "./routes/internal";

/**
 * Prisma Client
 * @const
 */

export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

/**
 * Logging the SQL queries, their parameters and the queryies' duration
 */

prisma.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});

const Server = new HyperExpress.Server();
// Cross-origin resource sharing
Server.use(cors());
// Fetch and some other functions check for a response from HTTP OPTIONS
Server.options("/*", (request, response) => {
  return response.send("");
});
// Internal route, meant to not be publicly available
Server.use("/internal", internalRouter);
// Public API
Server.use("/api", therapistRouter);

const serverPort = Number(process.env.PORT) || 4000;

Server.listen(serverPort)
  .then((socket) => console.log(`Webserver started on port ${serverPort}`))
  .catch((error) =>
    console.log(`Failed to start webserver on port ${serverPort}`)
  );

/**
 * Reconnecting websocket for communicating with the SMS API
 * {@link https://github.com/telaak/serial-gsm-rest}
 */

const ws = new ReconnectingWebSocket(
  process.env.WEBSOCKET || "ws://127.0.0.1:4000/ws/connect",
  [],
  {
    WebSocket: WebSocket,
    maxReconnectionDelay: 250,
    minReconnectionDelay: 10,
  }
);

/**
 * Event listener for new messages from the SMS gateway
 * {@link https://github.com/telaak/serial-gsm-rest}
 * TODO: migrate to an "actual" SMS gateway
 */

// @ts-ignore:next-line
ws.addEventListener("message", async (event) => {
  const data = JSON.parse(event.data);
  const textMessage: SMSMessage = data.message;
  if (data.type === "newMessage") {
    switch (textMessage.message) {
      case "Kyllä": {
        const therapists = await prisma.therapist.updateMany({
          where: {
            isActive: false,
          },
          data: {
            isActive: true,
            lastActive: new Date(),
          },
        });
        revalidateNext();
        break;
      }
      case "Ei": {
        const therapists = await prisma.therapist.updateMany({
          where: {
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
        revalidateNext();
        break;
      }
    }
  }
});

/**
 * Revalidates the frontend's (Nextjs) index page (table)
 */

export const revalidateNext = async () => {
  try {
    await fetch(
      `${process.env.NEXT_URL}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}`
    ).then((res) => res.json().then((json) => console.log(json)));
  } catch (error) {
    console.error(error);
  }
};

/**
 * Purges cloudflare's cache
 * Called after parsing emails
 * TODO: add it to therapist upserts
 */

export const purgeCloudflare = async () => {
  try {
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        },
        body: JSON.stringify({
          purge_everything: true,
        }),
      }
    )
      .then((res) => res.json())
      .then(console.log);
  } catch (error) {
    console.error(error);
  }
};
