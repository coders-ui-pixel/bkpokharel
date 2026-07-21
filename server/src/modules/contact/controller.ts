import { Request, Response } from "express";
import * as contactService from "./service";
import { createContactMessageSchema } from "./schema";

export async function create(req: Request, res: Response) {
  const input = createContactMessageSchema.parse(req.body);
  const message = await contactService.createContactMessage(input);
  res.status(201).json({ message });
}

export async function list(_req: Request, res: Response) {
  const messages = await contactService.listContactMessages();
  res.json({ messages });
}
