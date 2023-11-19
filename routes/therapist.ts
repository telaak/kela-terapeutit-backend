import HyperExpress from "hyper-express";
import { prisma } from "..";
import { Therapist, Therapy } from "@prisma/client";
export const therapistRouter = new HyperExpress.Router();

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
    });
    res.json(therapists);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

therapistRouter.post("/therapist", async (req, res) => {
  try {
    const therapist: Therapist & { therapies: Therapy[] } = await req.json();
    await prisma.therapist.upsert({
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
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});
