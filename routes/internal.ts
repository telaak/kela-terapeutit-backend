import { Therapist, Therapy } from "@prisma/client";
import HyperExpress from "hyper-express";
import { prisma } from "..";

export const internalRouter = new HyperExpress.Router();

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
