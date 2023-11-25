import HyperExpress from "hyper-express";
import { prisma, purgeCloudflare, revalidateNext } from "..";
import { ParsedEmail } from "../types";
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
