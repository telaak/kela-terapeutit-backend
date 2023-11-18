import HyperExpress, { SendableData } from "hyper-express";
import { prisma } from "..";
import { Therapist } from "@prisma/client";
export const therapistRouter = new HyperExpress.Router();

therapistRouter.get("/therapist", async (req, res) => {
  try {
    // const therapists = await prisma.therapist.findMany({
    //   include: {
    //     languages: true,
    //     orientations: true,
    //     therapies: true,
    //     locations: true,
    //     phoneNumbers: true,
    //   },
    // });
    const therapists = await prisma.therapist.findMany({
      include: {
        therapies: true,
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
    const therapist = await req.json();
    const newTherapist = {
      ...therapist,
      therapies: {
        create: therapist.therapies.map((kuntoutus: any) => {
          return {
            muoto: kuntoutus.muoto,
            lajit: kuntoutus.lajit,
          };
        }),
      },
    };
    await prisma.therapist.upsert({
      where: {
        name: newTherapist.name,
      },
      update: newTherapist,
      create: newTherapist,
    });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});
