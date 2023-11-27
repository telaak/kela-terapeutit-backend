import HyperExpress from "hyper-express";
import { prisma, purgeCloudflare, revalidateNext } from "..";
import { ParsedEmail } from "../types";

/**
 * HyperExpress router
 * @const
 * @namespace internalRouter
 */

export const therapistRouter = new HyperExpress.Router();

/**
 * Public API route's endpoint for getting all therapists
 * Selects only the needed fields and omits ids etc for a smaller payload
 * Links therapy types together
 */

therapistRouter.get("/therapist", async (req, res) => {
  try {
    const therapists = await prisma.therapist.findMany({
      select: {
        name: true,
        locations: true,
        phoneNumbers: true,
        languages: true,
        orientations: true,
        therapies: {
          select: {
            lajit: true,
            muoto: true,
          },
        },
        email: true,
        homepage: true,
        lastActive: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    res.json(therapists);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

/**
 * Public route for parsing emails from a Cloudflare email worker
 * Checks for a secret "password" and then updates based on the content and subject
 * TODO: make it check the sender's address against existing therapist(s)
 */

therapistRouter.post("/parse", async (req, res) => {
  try {
    const email: ParsedEmail = await req.json();
    if (email.secret !== process.env.EMAIL_SECRET)
      return res.status(401).send();
    const trimmedText = email.text.trim();
    const trimmedSubject = email.subject.trim();
    await prisma.therapist.updateMany({
      where: {
        email: trimmedText,
      },
      data: {
        lastActive: new Date(),
        isActive: trimmedSubject === "enable" ? true : false,
      },
    });
    await revalidateNext();
    await purgeCloudflare();
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});
