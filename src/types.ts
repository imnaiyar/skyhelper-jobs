import { Document } from "mongoose";

export interface GuildSchema extends Document {
  _id: string;
  data: {
    name: string;
    region: string;
    owner: string;
    joinedAt: Date;
    leftAt: Date;
    bots: number;
  };
  annoucement_channel: string | null;
  beta: boolean;
  prefix: string;
  language?: {
    name: string;
    value: string;
    flag?: string;
  };
  reminders: Reminders;
  autoShard: LiveUpdates;
  autoTimes: LiveUpdates;
}

export interface LiveUpdates {
  active: boolean;
  messageId: string;
  webhook: {
    id: string | null;
    token: string | null;
  };
}
export interface EventReminder {
  active: boolean;
  last_messageId?: string;
  role: string | null;
}
export interface Reminders {
  active: boolean;
  default_role: string | null;
  dailies: EventReminder;
  grandma: EventReminder;
  turtle: EventReminder;
  geyser: EventReminder;
  reset: EventReminder;
  eden: EventReminder;
  webhook: {
    id: string | null;
    token: string | null;
    channelId: string | null;
  };
}
export interface BaseTimes {
  /* Whether the event is active or not */
  active: boolean;

  /* The time when the event starts */
  nextTime: moment.Moment;

  /* The countdown to the event */
  duration: string;
}

interface ActiveTimes extends BaseTimes {
  active: true;
  /* The time when the event started if active */
  startTime: moment.Moment;

  /* The time when the event ends if active */
  endTime: moment.Moment;
}
interface NotActiveTimes extends BaseTimes {
  active: false;
  /* The time when the event started if active */
  startTime?: moment.Moment;

  /* The time when the event ends if active */
  endTime?: moment.Moment;
}
export type Times = ActiveTimes | NotActiveTimes;

interface Level {
  title: string;
  description?: string;
  image: string;
}
interface BaseSpiritData {
  name: string;
  type: string;
  realm?: string;
  icon?: string;
  emote?: {
    icon: string;
    level: Level[];
  };
  call?: {
    title: string;
    icon: string;
    image: string;
  };
  stance?: {
    title: string;
    icon: string;
    image: string;
  };
  action?: {
    icon: string;
    level: Level[];
  };
}

export interface SeasonalSpiritData extends BaseSpiritData {
  type: "Seasonal Spirit";
  season: string;
  current?: boolean;
  ts: {
    eligible: boolean;
    returned: boolean;
    total?: string;
    dates: string[];
  };
  tree?: {
    by: string;
    total: string;
    image: string;
  };
  location?: {
    by: string;
    description?: string;
    image: string;
  };
}

export interface RegularSpiritData extends BaseSpiritData {
  type: "Regular Spirit";
  main: {
    description: string;
    total?: string;
    image: string;
  };
}
export type SpiritsData = SeasonalSpiritData | RegularSpiritData;
