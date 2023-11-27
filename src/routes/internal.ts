import { Therapist, Therapy } from "@prisma/client";
import HyperExpress from "hyper-express";
import { prisma } from "..";

/**
 * HyperExpress router
 * @const
 * @namespace internalRouter
 */

export const internalRouter = new HyperExpress.Router();

/**
 * Internal route the scraper uses to POST therapists
 * Upserts based on the therapist's name which is assumed to be unique
 */

internalRouter.post("/therapist", async (req, res) => {
  try {
    const therapist: Therapist & { therapies: Therapy[] } = await req.json();
    const upsert = await prisma.therapist.upsert({
      where: {
        name: therapist.name,
      },
      update: {
        ...therapist,
        therapies: {
          // Deletes the linked therapies first so there are no duplicates
          deleteMany: {},
          create: therapist.therapies,
        },
      },
      create: {
        ...therapist,
        therapies: {
          create: therapist.therapies,
        },
      },
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
});
