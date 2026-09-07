import { addDays, addHours, addMinutes, formatISO, setHours, setMinutes, startOfDay, subDays } from "date-fns";
import { SYSTEM_TEMPLATES } from "@/lib/notifications/templates";
import type { DatabaseSnapshot } from "@/types";

export const IDS = {
  user: "user_asilbek",
  business: "biz_stom",
  staffAli: "staff_ali",
  staffMadina: "staff_madina",
  staffDilnoza: "staff_dilnoza",
  serviceCleaning: "svc_cleaning",
  serviceConsult: "svc_consult",
  serviceTreatment: "svc_treatment",
  serviceFollowup: "svc_followup",
  serviceWhitening: "svc_whitening",
  clientJohn: "cli_john",
  clientMadina: "cli_madina",
  clientBekzod: "cli_bekzod",
  clientAziza: "cli_aziza",
  clientDilshod: "cli_dilshod",
  clientSardor: "cli_sardor",
  clientMalika: "cli_malika",
  clientNodira: "cli_nodira",
  clientJasur: "cli_jasur",
  clientKamila: "cli_kamila",
  tagRegular: "tag_regular",
  tagVip: "tag_vip",
  tagNew: "tag_new",
};

function at(day: Date, hours: number, minutes: number) {
  return formatISO(setMinutes(setHours(day, hours), minutes));
}

function defaultWorkingHours(businessId: string) {
  return [1, 2, 3, 4, 5]
    .map((weekday) => ({
      id: `wh_${weekday}`,
      businessId,
      weekday,
      isClosed: false,
      ranges: [{ start: "09:00", end: "18:00" }],
      breaks: [{ start: "13:00", end: "14:00" }],
    }))
    .concat([
      {
        id: "wh_6",
        businessId,
        weekday: 6,
        isClosed: false,
        ranges: [{ start: "10:00", end: "15:00" }],
        breaks: [],
      },
      {
        id: "wh_0",
        businessId,
        weekday: 0,
        isClosed: true,
        ranges: [],
        breaks: [],
      },
    ]);
}

function splitName(name: string, givenName?: string) {
  const source = (givenName || name).trim() || "Owner";
  const [first, ...rest] = source.split(/\s+/);
  const lastFromName = name.trim().split(/\s+/).slice(1).join(" ");
  return {
    firstName: first,
    lastName: rest.join(" ") || lastFromName,
  };
}

export function createEmptyWorkspace(account: { id: string; name: string; givenName?: string }): DatabaseSnapshot {
  const createdAt = formatISO(new Date());
  const safeId = account.id.replace(/[^a-zA-Z0-9_-]/g, "") || "account";
  const userId = `user_${safeId}`;
  const businessId = `biz_${safeId}`;
  const staffId = `staff_${safeId}`;
  const { firstName, lastName } = splitName(account.name, account.givenName);

  return {
    currentUserId: userId,
    currentBusinessId: businessId,
    users: [
      {
        id: userId,
        telegramId: 0,
        firstName,
        lastName,
        languageCode: "uz",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    businesses: [
      {
        id: businessId,
        name: "",
        type: "other",
        category: "medical service",
        timezone: "Asia/Tashkent",
        currency: "USD",
        onboardingComplete: false,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    members: [{ id: `mem_${safeId}`, businessId, userId, role: "owner", createdAt }],
    tags: [
      { id: `tag_regular_${safeId}`, businessId, name: "Regular", color: "#187ACC" },
      { id: `tag_vip_${safeId}`, businessId, name: "VIP", color: "#C9A227" },
      { id: `tag_new_${safeId}`, businessId, name: "New", color: "#2A9D8F" },
    ],
    clients: [],
    clientTags: [],
    services: [],
    staff: [
      {
        id: staffId,
        businessId,
        userId,
        firstName,
        lastName,
        title: "Owner",
        color: "#187ACC",
        active: true,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    staffServices: [],
    workingHours: defaultWorkingHours(businessId),
    holidays: [],
    appointments: [],
    appointmentNotes: [],
    appointmentStatusHistory: [],
    templates: SYSTEM_TEMPLATES.map((template, index) => ({
      id: `tpl_${index + 1}`,
      businessId,
      name: template.name,
      channel: "sms" as const,
      content: template.content,
      isSystem: true,
    })),
    messages: [],
    messageLogs: [],
    notificationJobs: [],
    analyticsEvents: [],
    settings: [{ businessId, reminderOffsetsMin: [1440, 60], defaultChannel: "sms" }],
    subscriptions: [{ id: `sub_${safeId}`, businessId, plan: "free", status: "active", createdAt }],
  };
}

export function createSeed(): DatabaseSnapshot {
  const now = new Date();
  const today = startOfDay(now);
  const createdAt = formatISO(now);

  const workingHours = defaultWorkingHours(IDS.business);

  return {
    currentUserId: IDS.user,
    currentBusinessId: IDS.business,
    users: [
      {
        id: IDS.user,
        telegramId: Number(process.env.NEXT_PUBLIC_DEV_USER_ID ?? "123456789"),
        firstName: "Asilbek",
        lastName: "Owner",
        username: "asilbek",
        languageCode: "en",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    businesses: [
      {
        id: IDS.business,
        name: "STOM Klinika",
        type: "dental",
        category: "medical service",
        timezone: "Asia/Tashkent",
        currency: "USD",
        phone: "+998 71 200 00 00",
        onboardingComplete: true,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    members: [
      {
        id: "mem_owner",
        businessId: IDS.business,
        userId: IDS.user,
        role: "owner",
        createdAt,
      },
    ],
    tags: [
      { id: IDS.tagRegular, businessId: IDS.business, name: "Regular", color: "#187ACC" },
      { id: IDS.tagVip, businessId: IDS.business, name: "VIP", color: "#C9A227" },
      { id: IDS.tagNew, businessId: IDS.business, name: "New", color: "#2A9D8F" },
    ],
    clients: [
      { id: IDS.clientJohn, businessId: IDS.business, firstName: "John", lastName: "Smith", phone: "+998 90 111 22 33", telegramUsername: "johnsmith", notes: "Prefers morning appointments.", createdAt, updatedAt: createdAt },
      { id: IDS.clientMadina, businessId: IDS.business, firstName: "Madina", lastName: "Karimova", phone: "+998 91 222 33 44", telegramUsername: "madina_k", telegramId: 700001, notes: "Sensitive to cold.", createdAt, updatedAt: createdAt },
      { id: IDS.clientBekzod, businessId: IDS.business, firstName: "Bekzod", lastName: "Rakhimov", phone: "+998 93 333 44 55", createdAt, updatedAt: createdAt },
      { id: IDS.clientAziza, businessId: IDS.business, firstName: "Aziza", lastName: "Karimova", phone: "+998 94 444 55 66", telegramUsername: "aziza", telegramId: 700002, createdAt, updatedAt: createdAt },
      { id: IDS.clientDilshod, businessId: IDS.business, firstName: "Dilshod", lastName: "Akhmedov", phone: "+998 95 555 66 77", createdAt, updatedAt: createdAt },
      { id: IDS.clientSardor, businessId: IDS.business, firstName: "Sardor", lastName: "Tursunov", phone: "+998 97 666 77 88", telegramUsername: "sardor_t", createdAt, updatedAt: createdAt },
      { id: IDS.clientMalika, businessId: IDS.business, firstName: "Malika", lastName: "Yusupova", phone: "+998 90 777 88 99", notes: "Follow-up after whitening.", createdAt, updatedAt: createdAt },
      { id: IDS.clientNodira, businessId: IDS.business, firstName: "Nodira", lastName: "Ismailova", phone: "+998 91 888 99 00", createdAt, updatedAt: createdAt },
      { id: IDS.clientJasur, businessId: IDS.business, firstName: "Jasur", lastName: "Abdullaev", phone: "+998 93 101 20 30", createdAt, updatedAt: createdAt },
      { id: IDS.clientKamila, businessId: IDS.business, firstName: "Kamila", lastName: "Nazarova", phone: "+998 94 202 30 40", telegramUsername: "kamila_n", createdAt, updatedAt: createdAt },
    ],
    clientTags: [
      { clientId: IDS.clientJohn, tagId: IDS.tagRegular },
      { clientId: IDS.clientMadina, tagId: IDS.tagVip },
      { clientId: IDS.clientAziza, tagId: IDS.tagRegular },
      { clientId: IDS.clientKamila, tagId: IDS.tagNew },
      { clientId: IDS.clientMalika, tagId: IDS.tagVip },
    ],
    services: [
      { id: IDS.serviceCleaning, businessId: IDS.business, name: "Dental cleaning", description: "Professional hygiene and polish", price: 30, durationMin: 30, active: true, createdAt, updatedAt: createdAt },
      { id: IDS.serviceConsult, businessId: IDS.business, name: "Consultation", description: "Exam and treatment plan", price: 20, durationMin: 30, active: true, createdAt, updatedAt: createdAt },
      { id: IDS.serviceTreatment, businessId: IDS.business, name: "Treatment", description: "Caries treatment and restoration", price: 100, durationMin: 60, active: true, createdAt, updatedAt: createdAt },
      { id: IDS.serviceFollowup, businessId: IDS.business, name: "Follow-up", description: "Short check after treatment", price: 15, durationMin: 20, active: true, createdAt, updatedAt: createdAt },
      { id: IDS.serviceWhitening, businessId: IDS.business, name: "Whitening", description: "In-office teeth whitening", price: 80, durationMin: 45, active: true, createdAt, updatedAt: createdAt },
    ],
    staff: [
      { id: IDS.staffAli, businessId: IDS.business, firstName: "Ali", lastName: "Saidov", title: "Dentist", color: "#187ACC", active: true, createdAt, updatedAt: createdAt },
      { id: IDS.staffMadina, businessId: IDS.business, firstName: "Madina", lastName: "Niyazova", title: "Dentist", color: "#2A9D8F", active: true, createdAt, updatedAt: createdAt },
      { id: IDS.staffDilnoza, businessId: IDS.business, firstName: "Dilnoza", lastName: "Karimova", title: "Assistant", color: "#C9A227", active: true, createdAt, updatedAt: createdAt },
    ],
    staffServices: [
      { staffId: IDS.staffAli, serviceId: IDS.serviceCleaning },
      { staffId: IDS.staffAli, serviceId: IDS.serviceConsult },
      { staffId: IDS.staffAli, serviceId: IDS.serviceTreatment },
      { staffId: IDS.staffMadina, serviceId: IDS.serviceCleaning },
      { staffId: IDS.staffMadina, serviceId: IDS.serviceConsult },
      { staffId: IDS.staffMadina, serviceId: IDS.serviceFollowup },
      { staffId: IDS.staffMadina, serviceId: IDS.serviceWhitening },
    ],
    workingHours,
    holidays: [
      {
        id: "hol_navruz",
        businessId: IDS.business,
        date: `${now.getFullYear()}-03-21`,
        name: "Navruz",
      },
    ],
    appointments: [
      { id: "apt_today_1", businessId: IDS.business, clientId: IDS.clientJohn, staffId: IDS.staffAli, serviceId: IDS.serviceCleaning, startAt: at(today, 9, 0), endAt: at(today, 9, 30), status: "confirmed", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_today_2", businessId: IDS.business, clientId: IDS.clientMadina, staffId: IDS.staffMadina, serviceId: IDS.serviceConsult, startAt: at(today, 10, 30), endAt: at(today, 11, 0), status: "scheduled", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_today_3", businessId: IDS.business, clientId: IDS.clientBekzod, staffId: IDS.staffAli, serviceId: IDS.serviceTreatment, startAt: at(today, 12, 0), endAt: at(today, 13, 0), status: "arrived", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_today_4", businessId: IDS.business, clientId: IDS.clientAziza, staffId: IDS.staffMadina, serviceId: IDS.serviceFollowup, startAt: at(today, 15, 30), endAt: at(today, 15, 50), status: "scheduled", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_tom_1", businessId: IDS.business, clientId: IDS.clientSardor, staffId: IDS.staffAli, serviceId: IDS.serviceConsult, startAt: at(addDays(today, 1), 11, 0), endAt: at(addDays(today, 1), 11, 30), status: "scheduled", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_tom_2", businessId: IDS.business, clientId: IDS.clientMalika, staffId: IDS.staffMadina, serviceId: IDS.serviceWhitening, startAt: at(addDays(today, 1), 14, 0), endAt: at(addDays(today, 1), 14, 45), status: "confirmed", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_wed_1", businessId: IDS.business, clientId: IDS.clientNodira, staffId: IDS.staffAli, serviceId: IDS.serviceTreatment, startAt: at(addDays(today, 3), 10, 0), endAt: at(addDays(today, 3), 11, 0), status: "scheduled", reminderEnabled: true, createdAt, updatedAt: createdAt },
      { id: "apt_hist_1", businessId: IDS.business, clientId: IDS.clientJohn, staffId: IDS.staffMadina, serviceId: IDS.serviceConsult, startAt: at(subDays(today, 4), 11, 0), endAt: at(subDays(today, 4), 11, 30), status: "completed", reminderEnabled: false, createdAt, updatedAt: createdAt },
      { id: "apt_hist_2", businessId: IDS.business, clientId: IDS.clientMadina, staffId: IDS.staffAli, serviceId: IDS.serviceCleaning, startAt: at(subDays(today, 9), 9, 30), endAt: at(subDays(today, 9), 10, 0), status: "completed", reminderEnabled: false, createdAt, updatedAt: createdAt },
      { id: "apt_hist_3", businessId: IDS.business, clientId: IDS.clientBekzod, staffId: IDS.staffAli, serviceId: IDS.serviceConsult, startAt: at(subDays(today, 18), 16, 0), endAt: at(subDays(today, 18), 16, 30), status: "completed", reminderEnabled: false, createdAt, updatedAt: createdAt },
      { id: "apt_hist_4", businessId: IDS.business, clientId: IDS.clientAziza, staffId: IDS.staffMadina, serviceId: IDS.serviceCleaning, startAt: at(subDays(today, 12), 12, 0), endAt: at(subDays(today, 12), 12, 30), status: "completed", reminderEnabled: false, createdAt, updatedAt: createdAt },
      { id: "apt_hist_5", businessId: IDS.business, clientId: IDS.clientDilshod, staffId: IDS.staffAli, serviceId: IDS.serviceTreatment, startAt: at(subDays(today, 6), 15, 0), endAt: at(subDays(today, 6), 16, 0), status: "cancelled", notes: "Asked to reschedule.", reminderEnabled: false, createdAt, updatedAt: createdAt },
      { id: "apt_hist_6", businessId: IDS.business, clientId: IDS.clientJasur, staffId: IDS.staffMadina, serviceId: IDS.serviceConsult, startAt: at(subDays(today, 2), 17, 0), endAt: at(subDays(today, 2), 17, 30), status: "no_show", reminderEnabled: false, createdAt, updatedAt: createdAt },
    ],
    appointmentNotes: [],
    appointmentStatusHistory: [
      { id: "ash_1", appointmentId: "apt_today_1", toStatus: "confirmed", createdAt },
      { id: "ash_2", appointmentId: "apt_today_3", fromStatus: "scheduled", toStatus: "arrived", createdAt },
    ],
    templates: SYSTEM_TEMPLATES.map((template, index) => ({
      id: `tpl_${index + 1}`,
      businessId: IDS.business,
      name: template.name,
      channel: "sms" as const,
      content: template.content,
      isSystem: true,
    })),
    messages: [
      {
        id: "msg_1",
        businessId: IDS.business,
        clientId: IDS.clientJohn,
        channel: "sms",
        templateId: "tpl_2",
        content: "Hello John Smith, your appointment at STOM Clinic is confirmed for today at 09:00.",
        status: "delivered",
        provider: "mock-sms",
        providerMessageId: "sms_demo_1",
        sentAt: formatISO(addHours(now, -3)),
        createdAt: formatISO(addHours(now, -3)),
      },
    ],
    messageLogs: [
      { id: "log_1", messageId: "msg_1", status: "queued", createdAt: formatISO(addHours(now, -3)) },
      { id: "log_2", messageId: "msg_1", status: "sent", createdAt: formatISO(addMinutes(addHours(now, -3), 1)) },
      { id: "log_3", messageId: "msg_1", status: "delivered", createdAt: formatISO(addMinutes(addHours(now, -3), 2)) },
    ],
    notificationJobs: [
      {
        id: "job_tom_sardor",
        businessId: IDS.business,
        appointmentId: "apt_tom_1",
        clientId: IDS.clientSardor,
        channel: "sms",
        type: "appointment_reminder",
        content: "Hello Sardor Tursunov, this is a reminder about your appointment at STOM Clinic tomorrow at 11:00.",
        runAt: at(today, 11, 0),
        status: "pending",
        createdAt,
      },
    ],
    analyticsEvents: [],
    settings: [
      {
        businessId: IDS.business,
        reminderOffsetsMin: [1440, 60],
        defaultChannel: "sms",
      },
    ],
    subscriptions: [
      {
        id: "sub_free",
        businessId: IDS.business,
        plan: "free",
        status: "active",
        createdAt,
      },
    ],
  };
}
