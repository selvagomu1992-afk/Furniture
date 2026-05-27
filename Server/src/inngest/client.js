// src/inngest/client.js — Inngest client singleton
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'jangid',
  name: 'Jangid',
  eventKey: process.env.INNGEST_EVENT_KEY || 'local',
});
