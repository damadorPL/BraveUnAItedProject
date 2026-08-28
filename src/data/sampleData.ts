import { Caller, CallRecord, Specialist } from "../types";

export const INITIAL_SPECIALISTS: Specialist[] = [
  {
    id: "spec-admin",
    name: "dr Michał Adamczyk (Admin)",
    role: "Administrator Systemu / Koordynator",
    title: "Administrator",
    guidanceType: "prawno-obywatelskie",
    avatarBg: "bg-rose-600",
    email: "admin@fundacja-spektrum.pl",
    isAdmin: true,
  },
  {
    id: "spec-1",
    name: "mgr Joanna Mrożek",
    role: "Koordynatorka / Psycholożka",
    title: "Psycholog",
    guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
    avatarBg: "bg-purple-600",
    email: "j.mrozek@fundacja-spektrum.pl",
    isAdmin: false,
  },
  {
    id: "spec-2",
    name: "mec. Anna Nowak",
    role: "Radca Prawny",
    title: "Prawnik",
    guidanceType: "prawno-obywatelskie",
    avatarBg: "bg-blue-600",
    email: "a.nowak@fundacja-spektrum.pl",
    isAdmin: false,
  },
  {
    id: "spec-3",
    name: "dr Barbara Wiśniewska",
    role: "Pedagożka / Doradca Rodzinny",
    title: "Doradca P2P",
    guidanceType: "Parent to Parent",
    avatarBg: "bg-emerald-600",
    email: "b.wisniewska@fundacja-spektrum.pl",
    isAdmin: false,
  },
  {
    id: "spec-4",
    name: "mgr Tomasz Lewandowski",
    role: "Konsultant Społeczny",
    title: "Konsultant Społeczny",
    guidanceType: "społeczne",
    avatarBg: "bg-indigo-600",
    email: "t.lewandowski@fundacja-spektrum.pl",
    isAdmin: false,
  },
];

export const INITIAL_CALLERS: Caller[] = [
  {
    id: "caller-1",
    firstName: "Katarzyna",
    lastName: "Kowalska",
    phoneNumber: "601 234 567",
    voivodeship: "mazowieckie",
    city: "Warszawa",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "orzeczenie o niepełnosprawności",
    tags: ["Syn 7 lat", "Orzeczenie WZON", "Wielokrotny kontakt"],
    attachments: [
      {
        id: "att-caller-1",
        name: "Orzeczenie_o_potrzebie_ksztalcenia_specjalnego_Jan.pdf",
        size: 348200,
        type: "pdf",
        mimeType: "application/pdf",
        uploadedAt: "2026-06-10T10:00:00.000Z",
        uploadedBySpecialistName: "mgr Joanna Mrożek",
        description: "Orzeczenie z Poradni PP nr 4 w Warszawie z zaleceniem nauczyciela współorganizującego.",
      },
      {
        id: "att-caller-2",
        name: "Wniosek_WZON_punkt_7_i_8_wzor.docx",
        size: 54100,
        type: "text",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploadedAt: "2026-07-14T11:40:00.000Z",
        uploadedBySpecialistName: "mec. Anna Nowak",
        description: "Wypełniony wstępnie wzór wniosku do Powiatowego Zespołu ds. Orzekania.",
      }
    ],
    createdAt: "2026-06-10T09:30:00.000Z",
    updatedAt: "2026-08-20T14:15:00.000Z",
  },
  {
    id: "caller-2",
    firstName: "Katarzyna",
    lastName: "Kowalska",
    phoneNumber: "502 987 654",
    voivodeship: "śląskie",
    city: "Katowice",
    beneficiaryTypes: ["rodzic", "opiekun"],
    hasDisabilityCertificate: "w trakcie",
    tags: ["Córka 5 lat", "Diagnoza F84", "Przedszkole"],
    createdAt: "2026-07-02T11:00:00.000Z",
    updatedAt: "2026-08-18T16:30:00.000Z",
  },
  {
    id: "caller-3",
    firstName: "Piotr",
    lastName: "Nowak",
    phoneNumber: "603 112 233",
    voivodeship: "pomorskie",
    city: "Gdańsk",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "umiarkowany",
    tags: ["Syn 14 lat", "Edukacja domowa", "TUS"],
    createdAt: "2026-05-18T14:20:00.000Z",
    updatedAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "caller-4",
    firstName: "Marta",
    lastName: "Wiśniewska",
    phoneNumber: "695 443 221",
    voivodeship: "małopolskie",
    city: "Kraków",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "w trakcie",
    tags: ["Bliźnięta 4 lata", "Wczesne wspomaganie"],
    createdAt: "2026-08-01T15:00:00.000Z",
    updatedAt: "2026-08-01T15:00:00.000Z",
  },
  {
    id: "caller-5",
    firstName: "Tomasz",
    lastName: "Wójcik",
    phoneNumber: "511 889 900",
    voivodeship: "dolnośląskie",
    city: "Wrocław",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "znaczny",
    tags: ["Syn 15 lat", "Kryzys nastoletni", "Fobia szkolna"],
    createdAt: "2026-08-12T16:30:00.000Z",
    updatedAt: "2026-08-12T16:30:00.000Z",
  },
  {
    id: "caller-6",
    firstName: "Agnieszka",
    lastName: "Kamińska",
    phoneNumber: "602 334 455",
    voivodeship: "wielkopolskie",
    city: "Poznań",
    beneficiaryTypes: ["rodzic", "opiekun"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "orzeczenie o niepełnosprawności",
    tags: ["Świadczenie pielęgnacyjne", "Praca rodzica"],
    createdAt: "2026-07-22T08:45:00.000Z",
    updatedAt: "2026-08-19T13:20:00.000Z",
  },
  {
    id: "caller-7",
    firstName: "Michał",
    lastName: "Zieliński",
    phoneNumber: "508 776 554",
    voivodeship: "kujawsko-pomorskie",
    city: "Bydgoszcz",
    beneficiaryTypes: ["osoba dorosła w spektrum"],
    hasDisabilityCertificate: "nie",
    tags: ["Dorosły 29 lat", "Diagnoza w dorosłości", "Praca biurowa"],
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "caller-8",
    firstName: "Ewa",
    lastName: "Szymańska",
    phoneNumber: "609 881 223",
    voivodeship: "lubelskie",
    city: "Lublin",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "lekki",
    tags: ["Córka 8 lat", "Trening TUS", "Relacje w klasie"],
    createdAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-07-20T11:45:00.000Z",
  },
  {
    id: "caller-9",
    firstName: "Anna",
    lastName: "Dąbrowska",
    phoneNumber: "792 334 112",
    voivodeship: "małopolskie",
    city: "Kraków",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "w trakcie",
    tags: ["Córka 6 lat", "Przedszkole integracyjne", "WWR"],
    createdAt: "2026-07-19T14:00:00.000Z",
    updatedAt: "2026-08-14T09:30:00.000Z",
  },
  {
    id: "caller-10",
    firstName: "Krzysztof",
    lastName: "Lewandowski",
    phoneNumber: "601 998 877",
    voivodeship: "podkarpackie",
    city: "Rzeszów",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "orzeczenie o niepełnosprawności",
    tags: ["Syn 10 lat", "PFRON", "Turnus rehabilitacyjny"],
    createdAt: "2026-05-10T12:00:00.000Z",
    updatedAt: "2026-08-11T15:20:00.000Z",
  },
  {
    id: "caller-11",
    firstName: "Jakub",
    lastName: "Wójcik",
    phoneNumber: "784 112 998",
    voivodeship: "zachodniopomorskie",
    city: "Szczecin",
    beneficiaryTypes: ["osoba dorosła w spektrum"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "lekki",
    tags: ["Student 21 lat", "Uczelnia wyższa", "Egzaminy"],
    createdAt: "2026-08-03T11:15:00.000Z",
    updatedAt: "2026-08-18T10:00:00.000Z",
  },
  {
    id: "caller-12",
    firstName: "Magdalena",
    lastName: "Kaczmarek",
    phoneNumber: "605 443 119",
    voivodeship: "świętokrzyskie",
    city: "Kielce",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "w trakcie",
    tags: ["Córka 5 lat", "Diagnoza różnicowa", "Poradnia"],
    createdAt: "2026-07-28T09:30:00.000Z",
    updatedAt: "2026-08-19T11:00:00.000Z",
  },
  {
    id: "caller-13",
    firstName: "Andrzej",
    lastName: "Kozłowski",
    phoneNumber: "512 667 334",
    voivodeship: "podlaskie",
    city: "Białystok",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "znaczny",
    tags: ["Syn 16 lat", "Mieszkalnictwo wspomagane", "WTZ"],
    createdAt: "2026-06-01T15:20:00.000Z",
    updatedAt: "2026-08-16T14:10:00.000Z",
  },
  {
    id: "caller-14",
    firstName: "Monika",
    lastName: "Jankowska",
    phoneNumber: "664 223 556",
    voivodeship: "opolskie",
    city: "Opole",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "umiarkowany",
    tags: ["Syn 11 lat", "Integracja sensoryczna", "Zasiłek pielęgnacyjny"],
    createdAt: "2026-07-11T13:40:00.000Z",
    updatedAt: "2026-08-21T10:15:00.000Z",
  },
  {
    id: "caller-15",
    firstName: "Robert",
    lastName: "Mazur",
    phoneNumber: "791 002 884",
    voivodeship: "lubuskie",
    city: "Zielona Góra",
    beneficiaryTypes: ["osoba dorosła w spektrum"],
    hasDisabilityCertificate: "nie",
    tags: ["Dorosły 35 lat", "Wypalenie zawodowe", "Relacje w zespole"],
    createdAt: "2026-08-08T16:00:00.000Z",
    updatedAt: "2026-08-23T15:30:00.000Z",
  },
  {
    id: "caller-16",
    firstName: "Dorota",
    lastName: "Kwiatkowska",
    phoneNumber: "603 554 771",
    voivodeship: "warmińsko-mazurskie",
    city: "Olsztyn",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "orzeczenie o niepełnosprawności",
    tags: ["Córka 7 lat", "Komunikacja AAC", "Wsparcie mowy"],
    createdAt: "2026-06-25T10:45:00.000Z",
    updatedAt: "2026-08-17T09:20:00.000Z",
  },
  {
    id: "caller-17",
    firstName: "Paweł",
    lastName: "Grabowski",
    phoneNumber: "501 667 889",
    voivodeship: "mazowieckie",
    city: "Radom",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    disabilityDegree: "umiarkowany",
    tags: ["Syn 12 lat", "Szkoła podstawowa", "Konflikt z nauczycielem"],
    createdAt: "2026-07-30T14:15:00.000Z",
    updatedAt: "2026-08-19T16:45:00.000Z",
  },
  {
    id: "caller-18",
    firstName: "Barbara",
    lastName: "Pawlak",
    phoneNumber: "693 445 110",
    voivodeship: "łódzkie",
    city: "Łódź",
    beneficiaryTypes: ["rodzic", "opiekun"],
    hasDisabilityCertificate: "w trakcie",
    tags: ["Syn 3 lata", "Podejrzenie autyzmu", "Wsparcie emocjonalne"],
    createdAt: "2026-08-14T09:10:00.000Z",
    updatedAt: "2026-08-14T09:10:00.000Z",
  },
];

export const INITIAL_RECORDS: CallRecord[] = [
  {
    "id": "rec-1",
    "callerId": "caller-1",
    "callDate": "2026-08-20T14:15:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "sytuacje kryzysowe",
      "wsparcie psychologiczne dla rodziców / opiekunów"
    ],
    "adviceDescription": "Matka zgłasza nasilenie zachowań trudnych u syna (7 lat) w związku ze zbliżającym się początkiem roku szkolnego. Trudności z adaptacją.",
    "notes": "Zalecono przygotowanie planu dnia w formie wizualnej (piktogramy), wcześniejsze odwiedzenie szkoły przed 1 września. Zaproponowano ponowny kontakt za 2 tygodnie.",
    "durationMinutes": 45,
    "createdAt": "2026-08-20T14:15:00.000Z"
  },
  {
    "id": "rec-2",
    "callerId": "caller-1",
    "callDate": "2026-07-14T11:30:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Pytanie o procedurę odwołania od orzeczenia WZON - brak przyznania punktu 7 i 8 (konieczność stałej opieki).",
    "notes": "Przedstawiono procedurę odwoławczą do Wojewódzkiego Zespołu ds. Orzekania o Niepełnosprawności. Wskazano termin 14 dni od doręczenia decyzji.",
    "durationMinutes": 30,
    "createdAt": "2026-07-14T11:30:00.000Z"
  },
  {
    "id": "rec-3",
    "callerId": "caller-1",
    "callDate": "2026-06-10T09:30:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "proces diagnostyczny - ścieżka i procedury"
    ],
    "adviceDescription": "Pierwszy kontakt. Matka po otrzymaniu diagnozy spektrum autyzmu u syna w Poradni PP. Poczucie bezradności, prośba o wskazanie dalszych kroków.",
    "notes": "Omówiono proces wczesnego wspomagania rozwoju (WWR), procedurę orzeczenia o potrzebie kształcenia specjalnego oraz przysługujące uprawnienia.",
    "durationMinutes": 60,
    "createdAt": "2026-06-10T09:30:00.000Z"
  },
  {
    "id": "rec-4",
    "callerId": "caller-2",
    "callDate": "2026-08-18T16:30:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "akceptacja diagnozy",
      "doświadczenie rodzicielskie - adaptacja szkolna"
    ],
    "adviceDescription": "Rozmowa rodzic-rodzic. Wsparcie emocjonalne dla matki 5-letniej dziewczynki w trakcie diagnozy. Wymiana doświadczeń dotyczących wyboru przedszkola.",
    "notes": "Podzielono się doświadczeniem adaptacji w przedszkolu integracyjnym. Zaproszono na grupę wsparcia online dla rodziców ze Śląska.",
    "durationMinutes": 50,
    "createdAt": "2026-08-18T16:30:00.000Z"
  },
  {
    "id": "rec-5",
    "callerId": "caller-2",
    "callDate": "2026-07-02T11:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "proces diagnostyczny - ścieżka i procedury"
    ],
    "adviceDescription": "Pierwszy telefon. Córka 5 lat z podejrzeniem spektrum ze strony przedszkola. Gdzie udać się na diagnozę w Katowicach?",
    "notes": "Wskazano publiczne i niepubliczne ośrodki diagnostyczne w Katowicach i Chorzowie. Wyjaśniono różnicę między diagnozą medyczną a pedagogiczną.",
    "durationMinutes": 40,
    "createdAt": "2026-07-02T11:00:00.000Z"
  },
  {
    "id": "rec-6",
    "callerId": "caller-3",
    "callDate": "2026-08-15T10:00:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Ojciec 14-latka pyta o procedurę przejścia na edukację domową z orzeczeniem o potrzebie kształcenia specjalnego.",
    "notes": "Wyjaśniono warunki formalne (art. 37 Prawa oświatowego), kwestię finansowania i wsparcia ze strony szkoły macierzystej.",
    "durationMinutes": 35,
    "createdAt": "2026-08-15T10:00:00.000Z"
  },
  {
    "id": "rec-7",
    "callerId": "caller-4",
    "callDate": "2026-08-01T15:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "wczesne wspomaganie rozwoju (WWR)",
      "wsparcie psychologiczne dla rodziców / opiekunów"
    ],
    "adviceDescription": "Konsultacja z mamą 4-letnich bliźniaków po podejrzeniu spektrum u obojga dzieci. Omówienie ścieżki uzyskania WWRD oraz bezpłatnej terapii.",
    "notes": "Zalecono złożenie wniosku do publicznej Poradni PP w Krakowie o opinię o wczesnym wspomaganiu rozwoju.",
    "durationMinutes": 50,
    "createdAt": "2026-08-01T15:50:00.000Z"
  },
  {
    "id": "rec-8",
    "callerId": "caller-5",
    "callDate": "2026-08-12T16:30:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "trudności emocjonalne i kryzysy w wieku nastoletnim",
      "relacje rówieśnicze"
    ],
    "adviceDescription": "Ojciec 15-latka zgłasza nasilone stany lękowe u syna, odmowę chodzenia do liceum i wycofanie społeczne. Podejrzenie maskowania autyzmu.",
    "notes": "Zalecono pilną konsultację z psychiatrą młodzieżowym oraz psychoterapię w nurcie CBT.",
    "durationMinutes": 30,
    "createdAt": "2026-08-12T17:00:00.000Z"
  },
  {
    "id": "rec-9",
    "callerId": "caller-6",
    "callDate": "2026-07-22T08:45:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Kwestia nowego świadczenia pielęgnacyjnego na zasadach od 2024 roku (możliwość łączenia pracy zarobkowej przez matkę z pobieraniem świadczenia).",
    "notes": "Przedstawiono aktualny stan prawny po nowelizacji ustawy o świadczeniach rodzinnych.",
    "durationMinutes": 25,
    "createdAt": "2026-07-22T09:10:00.000Z"
  },
  {
    "id": "rec-10",
    "callerId": "caller-7",
    "callDate": "2026-08-05T10:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "diagnoza w dorosłości - psychoedukacja",
      "radzenie sobie z przebodźcowaniem sensorycznym"
    ],
    "adviceDescription": "Rozmowa z 29-letnim mężczyzną po diagnozie spektrum. Trudności w pracy typu open-space, przebodźcowanie hałasem i światłem.",
    "notes": "Omówiono strategie adaptacyjne (słuchawki ANC, praca zdalna, prośba o cichy pokój).",
    "durationMinutes": 45,
    "createdAt": "2026-08-05T10:45:00.000Z"
  },
  {
    "id": "rec-11",
    "callerId": "caller-8",
    "callDate": "2026-06-15T09:00:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "doświadczenie rodzicielskie - adaptacja szkolna",
      "trening umiejętności społecznych (TUS)"
    ],
    "adviceDescription": "Wskazówki dla rodzica dotyczące wyboru sprawdzonej grupy Treningu Umiejętności Społecznych (TUS) w Lublinie.",
    "notes": "Podano kryteria dobrej grupy TUS (mała liczebność, kwalifikacje terapeutów).",
    "durationMinutes": 30,
    "createdAt": "2026-06-15T09:30:00.000Z"
  },
  {
    "id": "rec-12",
    "callerId": "caller-9",
    "callDate": "2026-07-19T14:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "wczesne wspomaganie rozwoju (WWR)",
      "adaptacja przedszkolna"
    ],
    "adviceDescription": "6-letnia dziewczynka przed pójściem do zerówki. Obawy rodziców przed brakiem wsparcia w grupie masowej. Wybór przedszkola integracyjnego.",
    "notes": "Zalecono wizytę adaptacyjną i spotkanie z psychologiem przedszkolnym przed 1 września.",
    "durationMinutes": 40,
    "createdAt": "2026-07-19T14:40:00.000Z"
  },
  {
    "id": "rec-13",
    "callerId": "caller-10",
    "callDate": "2026-05-10T12:00:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "dofinansowania PFRON i turnusy rehabilitacyjne",
      "ulgi i uprawnienia"
    ],
    "adviceDescription": "Zasady składania wniosku w systemie SOW o dofinansowanie turnusu rehabilitacyjnego ze środków PFRON (PCPR Rzeszów).",
    "notes": "Wyjaśniono progi dochodowe i wymagane zaświadczenie lekarskie o stanie zdrowia.",
    "durationMinutes": 25,
    "createdAt": "2026-05-10T12:25:00.000Z"
  },
  {
    "id": "rec-14",
    "callerId": "caller-11",
    "callDate": "2026-08-03T11:15:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "e-mail",
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD",
      "dyskryminacja i prawa pracownicze"
    ],
    "adviceDescription": "Student 3. roku informatyki w Szczecinie. Dziekanat odmawia wydłużenia czasu na egzaminach pisemnych pomimo orzeczenia i zaświadczeń.",
    "notes": "Przygotowano podstawę prawną z Ustawy - Prawo o szkolnictwie wyższym (art. 214) oraz zalecenie kontaktu z Pełnomocnikiem Rektora ds. Osób z Niepełnosprawnościami.",
    "durationMinutes": 35,
    "createdAt": "2026-08-03T11:50:00.000Z"
  },
  {
    "id": "rec-15",
    "callerId": "caller-12",
    "callDate": "2026-07-28T09:30:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "proces diagnostyczny - ścieżka i procedury",
      "wsparcie psychologiczne dla rodziców / opiekunów"
    ],
    "adviceDescription": "Mama 5-letniej dziewczynki z Kielc. Wyjaśnienie różnicy między diagnozą psychologiczno-pedagogiczną a lekarską diagnozą F84 według ICD-10.",
    "notes": "Przekazano listę publicznych ośrodków diagnostycznych na terenie woj. świętokrzyskiego.",
    "durationMinutes": 45,
    "createdAt": "2026-07-28T10:15:00.000Z"
  },
  {
    "id": "rec-16",
    "callerId": "caller-13",
    "callDate": "2026-06-01T15:20:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "mieszkalnictwo wspomagane i placówki pobytu",
      "aktywizacja zawodowa i zatrudnienie wspomagane"
    ],
    "adviceDescription": "Plany na przyszłość dla 16-letniego syna ze znacznym stopniem niepełnosprawności. Informacja o Warsztatach Terapii Zajęciowej (WTZ) i Środowiskowych Domach Samopomocy (ŚDS).",
    "notes": "Wskazano procedurę skierowania z MOPS/PCPR.",
    "durationMinutes": 40,
    "createdAt": "2026-06-01T16:00:00.000Z"
  },
  {
    "id": "rec-17",
    "callerId": "caller-14",
    "callDate": "2026-07-11T13:40:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "ulgi i uprawnienia",
      "dofinansowania PFRON i turnusy rehabilitacyjne"
    ],
    "adviceDescription": "Ulga rehabilitacyjna w PIT dla rodzica dziecka z orzeczeniem o niepełnosprawności. Koszty dojazdów na zabiegi i leki.",
    "notes": "Wyjaśniono limity odliczeń i wymaganą dokumentację medyczną dla Urzędu Skarbowego.",
    "durationMinutes": 30,
    "createdAt": "2026-07-11T14:10:00.000Z"
  },
  {
    "id": "rec-18",
    "callerId": "caller-15",
    "callDate": "2026-08-08T16:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "diagnoza w dorosłości - psychoedukacja",
      "trudności emocjonalne i kryzysy w wieku nastoletnim"
    ],
    "adviceDescription": "35-letni programista z Zielonej Góry z podejrzeniem spektrum autyzmu. Poczucie ciągłego niedopasowania i wyczerpania kontaktami społecznymi.",
    "notes": "Zalecono kontakt ze specjalistą diagnozującym dorosłych oraz lekturę materiałów psychoedukacyjnych.",
    "durationMinutes": 50,
    "createdAt": "2026-08-08T16:50:00.000Z"
  },
  {
    "id": "rec-19",
    "callerId": "caller-16",
    "callDate": "2026-06-25T10:45:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "rozwój mowy i komunikacji (AAC)",
      "radzenie sobie z trudnymi zachowaniami w domu"
    ],
    "adviceDescription": "7-letnia niemówiąca dziewczynka z autyzmem. Wdrożenie alternatywnych metod komunikacji (AAC - symbole MÓWiK, PECS).",
    "notes": "Przekazano kontakt do certyfikowanego terapeuty AAC w Olsztynie.",
    "durationMinutes": 45,
    "createdAt": "2026-06-25T11:30:00.000Z"
  },
  {
    "id": "rec-20",
    "callerId": "caller-17",
    "callDate": "2026-07-30T14:15:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Konflikt z wychowawcą w szkole podstawowej w Radomiu - brak realizacji zaleceń z IPET (Indywidualnego Programu Edukacyjno-Terapeutycznego).",
    "notes": "Wskazano możliwość zawnioskowania o ewaluację IPET i udział rodzica w zespole nauczycieli.",
    "durationMinutes": 35,
    "createdAt": "2026-07-30T14:50:00.000Z"
  },
  {
    "id": "rec-21",
    "callerId": "caller-18",
    "callDate": "2026-08-14T09:10:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "doświadczenie rodzicielskie - adaptacja szkolna",
      "akceptacja diagnozy"
    ],
    "adviceDescription": "Rozmowa wsparciowa dla mamy 3-letniego chłopca przed pierwszą wizytą w poradni. Jak przygotować dziecko i siebie na badanie.",
    "notes": "Udzielono wsparcia emocjonalnego i podzielono się doświadczeniem pierwszych kroków terapeutycznych.",
    "durationMinutes": 40,
    "createdAt": "2026-08-14T09:50:00.000Z"
  },
  {
    "id": "rec-22",
    "callerId": "caller-1",
    "callDate": "2026-08-25T11:20:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Konsultacja w sprawie odwołania od odmownej decyzji punktu 7 i 8 orzeczenia o niepełnosprawności do Wojewódzkiego Zespołu (WZON).",
    "notes": "Przeanalizowano dostarczoną dokumentację medyczną. Przygotowano argumentację o konieczności stałej opieki.",
    "durationMinutes": 45,
    "createdAt": "2026-08-25T12:05:00.000Z"
  },
  {
    "id": "rec-23",
    "callerId": "caller-2",
    "callDate": "2026-08-24T14:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "sytuacje kryzysowe",
      "wsparcie psychologiczne rodziców i opiekunów"
    ],
    "adviceDescription": "Trudne zachowania i przebodźcowanie po powrocie ze szkoły integracyjnej. Zastosowanie technik wyciszających i kącika relaksacyjnego.",
    "notes": "Zalecono wprowadzenie planu dnia w formie piktogramów oraz konsultację z terapeutą SI.",
    "durationMinutes": 40,
    "createdAt": "2026-08-24T14:40:00.000Z"
  },
  {
    "id": "rec-24",
    "callerId": "caller-3",
    "callDate": "2026-08-22T09:30:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "życie codzienne/samodzielność",
      "placówki diagnostyczne, terapeutyczne i edukacyjne"
    ],
    "adviceDescription": "Wybór Warsztatów Terapii Zajęciowej (WTZ) oraz Klubu Samopomocy dla 20-latka po ukończeniu szkoły specjalnej przysposabiającej do pracy.",
    "notes": "Przekazano listę aktywnych placówek w Trójmieście oferujących pracownie stolarskie i komputerowe.",
    "durationMinutes": 50,
    "createdAt": "2026-08-22T10:20:00.000Z"
  },
  {
    "id": "rec-25",
    "callerId": "caller-4",
    "callDate": "2026-08-21T16:15:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon",
      "e-mail"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Zapewnienie bezpłatnego transportu dziecka z autyzmem do szkoły specjalnej przez gminę zgodnie z art. 39 Prawa oświatowego.",
    "notes": "Wskazano gminny obowiązek zwrotu kosztów dowozu lub organizacji busa dla ucznia z orzeczeniem.",
    "durationMinutes": 35,
    "createdAt": "2026-08-21T16:50:00.000Z"
  },
  {
    "id": "rec-26",
    "callerId": "caller-5",
    "callDate": "2026-08-20T10:00:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "rodzaje poradnictwa",
      "wsparcie terapeutyczne"
    ],
    "adviceDescription": "Dofinansowanie do turnusu rehabilitacyjnego ze środków PFRON (program MOPS/PCPR). Jak złożyć wniosek przez system SOW.",
    "notes": "Przekazano instrukcję rejestracji profilu zaufanego i składania e-wniosku.",
    "durationMinutes": 30,
    "createdAt": "2026-08-20T10:30:00.000Z"
  },
  {
    "id": "rec-27",
    "callerId": "caller-6",
    "callDate": "2026-08-19T13:45:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "prawo pracy"
    ],
    "adviceDescription": "Dostosowanie warunków pracy dla pracownika w spektrum autyzmu (redukcja hałasu, elastyczny czas pracy, praca hybrydowa).",
    "notes": "Przedstawiono uprawnienia wynikające z Kodeksu pracy i Ustawy o rehabilitacji zawodowej.",
    "durationMinutes": 45,
    "createdAt": "2026-08-19T14:30:00.000Z"
  },
  {
    "id": "rec-28",
    "callerId": "caller-7",
    "callDate": "2026-08-18T15:10:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "kompetencje społeczne",
      "terapia"
    ],
    "adviceDescription": "Dobór grupy Treningu Umiejętności Społecznych (TUS) dla 9-letniej dziewczynki z zespołem Aspergera z trudnościami rówieśniczymi.",
    "notes": "Skierowano do bezpłatnego projektu TUS współfinansowanego z PFRON w Krakowie.",
    "durationMinutes": 40,
    "createdAt": "2026-08-18T15:50:00.000Z"
  },
  {
    "id": "rec-29",
    "callerId": "caller-8",
    "callDate": "2026-08-17T11:00:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "oddziaływania wychowawcze/grupy wsparcia dla rodziców"
    ],
    "adviceDescription": "Wsparcie rodzicielskie dla ojca po otrzymaniu diagnozy spektrum u 4-letniego syna. Jak rozmawiać z rodzeństwem i dziadkami.",
    "notes": "Zaproszono na comiesięczną grupę wsparcia online dla ojców.",
    "durationMinutes": 45,
    "createdAt": "2026-08-17T11:45:00.000Z"
  },
  {
    "id": "rec-30",
    "callerId": "caller-9",
    "callDate": "2026-08-16T12:30:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "aktywizacja zawodowa",
      "wsparcie psychologiczne osób z ASD"
    ],
    "adviceDescription": "Trening przed rozmową kwalifikacyjną dla dorosłego samorzecznika z wykształceniem informatycznym. Przygotowanie do pytań behawioralnych.",
    "notes": "Zalecono kontakt z doradcą zawodowym z programu Aktywni Samodzielni.",
    "durationMinutes": 50,
    "createdAt": "2026-08-16T13:20:00.000Z"
  },
  {
    "id": "rec-31",
    "callerId": "caller-10",
    "callDate": "2026-08-15T09:15:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "przebieg diagnostyki"
    ],
    "adviceDescription": "Etapy diagnozy spektrum autyzmu w ramach NFZ (skierowanie od pediatry/psychiatry, czas oczekiwania, kryteria ADOS-2).",
    "notes": "Podano listę ośrodków wczesnej interwencji w województwie zachodniopomorskim.",
    "durationMinutes": 35,
    "createdAt": "2026-08-15T09:50:00.000Z"
  },
  {
    "id": "rec-32",
    "callerId": "caller-11",
    "callDate": "2026-08-14T10:40:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "ubezwłasnowolnienie/reprezentacja"
    ],
    "adviceDescription": "Prawne formy wsparcia dorosłego syna o znacznym stopniu niepełnosprawności zamiast ubezwłasnowolnienia (pełnomocnictwo medyczne i bankowe).",
    "notes": "Przedstawiono nadchodzące zmiany w polskim prawie dotyczące modeli wspieranego podejmowania decyzji.",
    "durationMinutes": 45,
    "createdAt": "2026-08-14T11:25:00.000Z"
  },
  {
    "id": "rec-33",
    "callerId": "caller-12",
    "callDate": "2026-08-13T14:50:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "rozwój mowy i komunikacji (AAC)",
      "terapia"
    ],
    "adviceDescription": "Wprowadzenie komunikatora z syntezą mowy (aplikacja AAC) dla 6-latka. Współpraca z przedszkolnym logopedą.",
    "notes": "Zalecono złożenie wniosku do programu PFRON 'Aktywny Samorząd' - Obszar C.",
    "durationMinutes": 40,
    "createdAt": "2026-08-13T15:30:00.000Z"
  },
  {
    "id": "rec-34",
    "callerId": "caller-13",
    "callDate": "2026-08-12T11:15:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "doświadczenie rodzicielskie - adaptacja szkolna"
    ],
    "adviceDescription": "Przygotowanie 13-latka do zmiany szkoły z podstawowej do branżowej. Spotkanie z dyrekcją i pedagogiem szkolnym.",
    "notes": "Podzielono się sprawdzonymi arkuszami profilu sensorycznego dla nowych nauczycieli.",
    "durationMinutes": 45,
    "createdAt": "2026-08-12T12:00:00.000Z"
  },
  {
    "id": "rec-35",
    "callerId": "caller-14",
    "callDate": "2026-08-11T16:00:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Procedura ubiegania się o nowe świadczenie wspierające dla dorosłego z autyzmem oraz ustalenie poziomu potrzeby wsparcia (punktacja WZON).",
    "notes": "Przeanalizowano formularz samooceny i kryteria punktowe w 32 czynnościach dnia codziennego.",
    "durationMinutes": 50,
    "createdAt": "2026-08-11T16:50:00.000Z"
  },
  {
    "id": "rec-36",
    "callerId": "caller-15",
    "callDate": "2026-08-10T13:30:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "diagnoza w dorosłości - psychoedukacja",
      "trudności emocjonalne i kryzysy w wieku nastoletnim"
    ],
    "adviceDescription": "Wsparcie dla kobiety po późnej diagnozie (32 lata). Praca nad samoakceptacją i demaskowaniem (unmasking).",
    "notes": "Polecono literaturę o kobiecym fenotypie autyzmu oraz grupę wsparcia online Dziewczyny w Spektrum.",
    "durationMinutes": 55,
    "createdAt": "2026-08-10T14:25:00.000Z"
  },
  {
    "id": "rec-37",
    "callerId": "caller-16",
    "callDate": "2026-08-09T09:45:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "wsparcie instytucjonalne",
      "rodzaje poradnictwa"
    ],
    "adviceDescription": "Program opieki wytchnieniowej dla rodziców dzieci ze znacznym stopniem niepełnosprawności w powiecie olsztyńskim.",
    "notes": "Podano terminy naboru wniosków w lokalnym MOPS oraz wymagane zaświadczenia lekarskie.",
    "durationMinutes": 30,
    "createdAt": "2026-08-09T10:15:00.000Z"
  },
  {
    "id": "rec-38",
    "callerId": "caller-17",
    "callDate": "2026-08-08T15:20:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Brak zgody dyrektora szkoły na obecność asystenta cienia finansowanego przez fundację. Prawa rodzica a przepisy oświatowe.",
    "notes": "Sporządzono szkic pisma powołującego się na wytyczne MEN i Rzecznika Praw Dziecka.",
    "durationMinutes": 40,
    "createdAt": "2026-08-08T16:00:00.000Z"
  },
  {
    "id": "rec-39",
    "callerId": "caller-18",
    "callDate": "2026-08-07T12:00:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "akceptacja diagnozy",
      "oddziaływania wychowawcze/grupy wsparcia dla rodziców"
    ],
    "adviceDescription": "Radzenie sobie z reakcjami otoczenia na sensoryczne ataki złości (meltdown) w miejscach publicznych (sklep, komunikacja miejska).",
    "notes": "Zalecono karty informacyjne 'Jestem w spektrum' oraz słuchawki wygłuszające.",
    "durationMinutes": 40,
    "createdAt": "2026-08-07T12:40:00.000Z"
  },
  {
    "id": "rec-40",
    "callerId": "caller-1",
    "callDate": "2026-08-06T14:10:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "radzenie sobie z trudnymi zachowaniami w domu",
      "kompetencje społeczne"
    ],
    "adviceDescription": "Wprowadzenie struktury wizualnej i tablicy motywacyjnej dla 7-latka z wybiórczością pokarmową i oporem przed kąpielą.",
    "notes": "Wskazano materiały ze strategią małych kroków (desensytyzacja) i nagradzania społecznego.",
    "durationMinutes": 35,
    "createdAt": "2026-08-06T14:45:00.000Z"
  },
  {
    "id": "rec-41",
    "callerId": "caller-2",
    "callDate": "2026-08-05T10:30:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Zasady łączenia pracy zarobkowej przez rodzica z pobieraniem świadczenia pielęgnacyjnego po reformie od 1 stycznia 2024 r.",
    "notes": "Szczegółowo wyjaśniono nowe zasady umożliwiające nielimitowany dochód dla opiekunów dzieci do 18 r.ż.",
    "durationMinutes": 35,
    "createdAt": "2026-08-05T11:05:00.000Z"
  },
  {
    "id": "rec-42",
    "callerId": "caller-3",
    "callDate": "2026-08-04T16:20:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "wsparcie instytucjonalne",
      "aktywizacja zawodowa"
    ],
    "adviceDescription": "Dostępność mieszkalnictwa wspomaganego i treningowego dla osób w spektrum autyzmu w województwie pomorskim.",
    "notes": "Podano namiary na projekty pilotażowe 'Bezpieczna przystań' realizowane z grantów EFS.",
    "durationMinutes": 40,
    "createdAt": "2026-08-04T17:00:00.000Z"
  },
  {
    "id": "rec-43",
    "callerId": "caller-4",
    "callDate": "2026-08-03T11:45:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Zwolnienie z nauki drugiego języka obcego dla ucznia z autyzmem na podstawie orzeczenia PPP. Wzór podania do dyrektora.",
    "notes": "Przywołano § 6 Rozporządzenia MEN w sprawie oceniania, klasyfikowania i promowania uczniów.",
    "durationMinutes": 30,
    "createdAt": "2026-08-03T12:15:00.000Z"
  },
  {
    "id": "rec-44",
    "callerId": "caller-5",
    "callDate": "2026-08-02T09:00:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "trudności emocjonalne i kryzysy w wieku nastoletnim",
      "sytuacje kryzysowe"
    ],
    "adviceDescription": "Myśli rezygnacyjne i fobia szkolna u 15-letniego chłopca w spektrum z doświadczeniem hejtu rówieśniczego.",
    "notes": "Pilnie przekazano namiary na bezpłatny Telefon Zaufania dla Dzieci i Młodzieży 116 111 oraz zalecenie pilnej konsultacji psychiatrycznej.",
    "durationMinutes": 50,
    "createdAt": "2026-08-02T09:50:00.000Z"
  },
  {
    "id": "rec-45",
    "callerId": "caller-6",
    "callDate": "2026-08-01T15:00:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "życie codzienne/samodzielność",
      "akceptacja diagnozy"
    ],
    "adviceDescription": "Organizacja przestrzeni domowej dla dorosłego samorzecznika z nadwrażliwością słuchową i węchową. Dobór rolet i oczyszczacza powietrza.",
    "notes": "Podzielono się patentami na wyciszenie pokoju za pomocą mat akustycznych i paneli filcowych.",
    "durationMinutes": 35,
    "createdAt": "2026-08-01T15:35:00.000Z"
  },
  {
    "id": "rec-46",
    "callerId": "caller-7",
    "callDate": "2026-07-31T10:15:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Uzyskanie karty parkingowej dla osoby niepełnosprawnej na podstawie orzeczenia z symbolem 12-C (autyzm).",
    "notes": "Wyjaśniono warunek posiadania w orzeczeniu wskazania do punktu 9 (karta parkingowa) z kodem przyczyny niepełnosprawności.",
    "durationMinutes": 30,
    "createdAt": "2026-07-31T10:45:00.000Z"
  },
  {
    "id": "rec-47",
    "callerId": "caller-8",
    "callDate": "2026-07-30T13:40:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "wsparcie terapeutyczne",
      "placówki diagnostyczne"
    ],
    "adviceDescription": "Wczesne Wspomaganie Rozwoju Dziecka (WWRD) w Lublinie - procedura ubiegania się o opinię w publicznej poradni PP.",
    "notes": "Przekazano wykaz placówek realizujących WWRD od 2. roku życia ze środków subwencji oświatowej.",
    "durationMinutes": 35,
    "createdAt": "2026-07-30T14:15:00.000Z"
  },
  {
    "id": "rec-48",
    "callerId": "caller-9",
    "callDate": "2026-07-29T11:00:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "wsparcie psychologiczne osób z ASD",
      "aktywizacja zawodowa"
    ],
    "adviceDescription": "Konsultacja w sprawie wyczerpania autystycznego (autistic burnout) u pracownika korporacji. Plan powrotu do równowagi.",
    "notes": "Zalecono natychmiastowe ograniczenie bodźców, zwolnienie lekarskie oraz sesje z psychoterapeutą nurty CBT zorientowanym na neuroatypowość.",
    "durationMinutes": 45,
    "createdAt": "2026-07-29T11:45:00.000Z"
  },
  {
    "id": "rec-49",
    "callerId": "caller-10",
    "callDate": "2026-07-28T14:30:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "rozwój mowy i komunikacji (AAC)",
      "kompetencje społeczne"
    ],
    "adviceDescription": "Wspieranie rozwoju mowy poprzez zabawy naprzemienne i czytanie uczestniczące u 3-letniego chłopca z cechami autyzmu.",
    "notes": "Przesłano zestawienie bezpłatnych pomocy dydaktycznych i książeczek kontrastowych.",
    "durationMinutes": 40,
    "createdAt": "2026-07-28T15:10:00.000Z"
  },
  {
    "id": "rec-50",
    "callerId": "caller-11",
    "callDate": "2026-07-27T16:00:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "doświadczenie rodzicielskie - adaptacja szkolna",
      "oddziaływania wychowawcze/grupy wsparcia dla rodziców"
    ],
    "adviceDescription": "Jak przygotować klasę rówieśniczą na przyjęcie dziecka z zespołem Aspergera bez stygmatyzowania (warsztaty 'Niebieska Klasa').",
    "notes": "Przekazano scenariusz lekcji wychowawczej i bajkę psychoedukacyjną 'Kosmita w szkole'.",
    "durationMinutes": 45,
    "createdAt": "2026-07-27T16:45:00.000Z"
  },
  {
    "id": "rec-51",
    "callerId": "caller-12",
    "callDate": "2026-07-26T09:20:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Przydział nauczyciela współorganizującego kształcenie integracyjne (nauczyciela wspomagającego) - wymiar godzin w orzeczeniu PPP.",
    "notes": "Wyjaśniono, że w orzeczeniu o potrzebie kształcenia specjalnego z uwagi na autyzm zatrudnienie takiego nauczyciela jest obligatoryjne.",
    "durationMinutes": 35,
    "createdAt": "2026-07-26T09:55:00.000Z"
  },
  {
    "id": "rec-52",
    "callerId": "caller-13",
    "callDate": "2026-07-25T12:45:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "wsparcie instytucjonalne",
      "rodzaje poradnictwa"
    ],
    "adviceDescription": "Dofinansowanie do zakupu sprzętu komputerowego i oprogramowania edukacyjnego z programu PFRON 'Aktywny Samorząd'.",
    "notes": "Przekazano harmonogram składania wniosków w systemie SOW dla mieszkańców Podlasia.",
    "durationMinutes": 30,
    "createdAt": "2026-07-25T13:15:00.000Z"
  },
  {
    "id": "rec-53",
    "callerId": "caller-14",
    "callDate": "2026-07-24T15:10:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "sytuacje kryzysowe",
      "radzenie sobie z trudnymi zachowaniami w domu"
    ],
    "adviceDescription": "Strategie wsparcia podczas lęku przed burzą i głośnymi dźwiękami u 11-latka z ASD. Termofor obciążeniowy i słuchawki ANC.",
    "notes": "Zalecono konsultację w poradni leczenia zaburzeń lękowych.",
    "durationMinutes": 40,
    "createdAt": "2026-07-24T15:50:00.000Z"
  },
  {
    "id": "rec-54",
    "callerId": "caller-15",
    "callDate": "2026-07-23T10:00:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "prawo pracy"
    ],
    "adviceDescription": "Ulgi podatkowe i odpisy rehabilitacyjne w PIT dla osoby dorosłej ze stopniem niepełnosprawności (leki, sprzęt, dojazdy).",
    "notes": "Wskazano art. 26 ust. 7a ustawy o PIT i warunki odliczenia wydatków na cele rehabilitacyjne.",
    "durationMinutes": 35,
    "createdAt": "2026-07-23T10:35:00.000Z"
  },
  {
    "id": "rec-55",
    "callerId": "caller-16",
    "callDate": "2026-07-22T13:30:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "życie codzienne/samodzielność",
      "akceptacja diagnozy"
    ],
    "adviceDescription": "Trening czystości (odpieluchowanie) u niemówiącego dziecka 5-letniego w spektrum autyzmu. Tablica krok po kroku.",
    "notes": "Podzielono się metodami behawioralnymi i schematem czasowym wysadzania na nocnik.",
    "durationMinutes": 45,
    "createdAt": "2026-07-22T14:15:00.000Z"
  },
  {
    "id": "rec-56",
    "callerId": "caller-17",
    "callDate": "2026-07-21T11:15:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Zasiłek pielęgnacyjny z urzędu gminy (MOPR) - terminy wypłat, konieczne dokumenty i wyrównanie od miesiąca złożenia wniosku.",
    "notes": "Wskazano na konieczność dołączenia prawomocnego orzeczenia o niepełnosprawności.",
    "durationMinutes": 25,
    "createdAt": "2026-07-21T11:40:00.000Z"
  },
  {
    "id": "rec-57",
    "callerId": "caller-18",
    "callDate": "2026-07-20T14:40:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "kompetencje społeczne",
      "terapia"
    ],
    "adviceDescription": "Wdrażanie strategii radzenia sobie z agresją słowną u nastolatka z zespołem Aspergera. Identyfikacja triggerów emocjonalnych.",
    "notes": "Polecono wprowadzenie termometru złości i przerw sensorycznych w trakcie nauki.",
    "durationMinutes": 40,
    "createdAt": "2026-07-20T15:20:00.000Z"
  },
  {
    "id": "rec-58",
    "callerId": "caller-1",
    "callDate": "2026-07-19T09:30:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "rodzaje poradnictwa",
      "wsparcie terapeutyczne"
    ],
    "adviceDescription": "Wybór turnusu rehabilitacyjnego nad morzem z programem hipoterapii i integracji sensorycznej dla rodziny z Mazowsza.",
    "notes": "Przekazano bazę zweryfikowanych ośrodków rehabilitacyjnych z wpisem do rejestru wojewody.",
    "durationMinutes": 30,
    "createdAt": "2026-07-19T10:00:00.000Z"
  },
  {
    "id": "rec-59",
    "callerId": "caller-2",
    "callDate": "2026-07-18T16:15:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Ewaluacja Wielospecjalistycznej Oceny Poziomu Funkcjonowania Ucznia (WOPFU) oraz modyfikacja IPET w szkole.",
    "notes": "Wskazano prawo rodzica do wnoszenia pisemnych uwag do IPET i żądania zwołania zespołu.",
    "durationMinutes": 45,
    "createdAt": "2026-07-18T17:00:00.000Z"
  },
  {
    "id": "rec-60",
    "callerId": "caller-3",
    "callDate": "2026-07-17T11:00:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "oddziaływania wychowawcze/grupy wsparcia dla rodziców",
      "akceptacja diagnozy"
    ],
    "adviceDescription": "Wsparcie dla starzejących się rodziców dorosłej osoby z autyzmem o znacznym stopniu. Zabezpieczenie przyszłości i opieki prawnej.",
    "notes": "Zaproszono na cykl webinarów prawno-społecznych 'Zabezpiecz Przyszłość Swojego Dziecka'.",
    "durationMinutes": 50,
    "createdAt": "2026-07-17T11:50:00.000Z"
  },
  {
    "id": "rec-61",
    "callerId": "caller-4",
    "callDate": "2026-07-16T13:45:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Wniesienie skargi do Wojewódzkiego Sądu Administracyjnego w sprawie odmowy przyznania punktu 7 przez WZON.",
    "notes": "Przedstawiono wymogi formalne skargi kasacyjnej i terminy procesowe.",
    "durationMinutes": 45,
    "createdAt": "2026-07-16T14:30:00.000Z"
  },
  {
    "id": "rec-62",
    "callerId": "caller-5",
    "callDate": "2026-07-15T10:20:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "wsparcie psychologiczne rodziców i opiekunów",
      "kompetencje społeczne"
    ],
    "adviceDescription": "Rozmowa wsparciowa dla matki samotnie wychowującej dwójkę dzieci w spektrum autyzmu. Zapobieganie syndromowi wypalenia rodzicielskiego.",
    "notes": "Skierowano do indywidualnych bezpłatnych konsultacji psychologicznych online w ramach projektu PFRON.",
    "durationMinutes": 45,
    "createdAt": "2026-07-15T11:05:00.000Z"
  },
  {
    "id": "rec-63",
    "callerId": "caller-6",
    "callDate": "2026-07-14T15:00:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "wsparcie terapeutyczne",
      "wsparcie instytucjonalne"
    ],
    "adviceDescription": "Kluby samopomocy i kręgi wsparcia dla dorosłych w spektrum autyzmu w Poznaniu. Integracja i wspólne inicjatywy.",
    "notes": "Podano adresy spotkań klubu 'Spektrum Możliwości' odbywających się w czwartki.",
    "durationMinutes": 30,
    "createdAt": "2026-07-14T15:30:00.000Z"
  },
  {
    "id": "rec-64",
    "callerId": "caller-7",
    "callDate": "2026-07-13T12:15:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Zindywidualizowana ścieżka kształcenia vs nauczanie indywidualne dla ucznia w kryzysie psychicznym.",
    "notes": "Wyjaśniono różnice w procedurze oraz zalety zindywidualizowanej ścieżki w utrzymaniu kontaktu z klasą.",
    "durationMinutes": 40,
    "createdAt": "2026-07-13T12:55:00.000Z"
  },
  {
    "id": "rec-65",
    "callerId": "caller-8",
    "callDate": "2026-07-12T09:40:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "akceptacja diagnozy",
      "życie codzienne/samodzielność"
    ],
    "adviceDescription": "Wprowadzenie diety sensorycznej i zabawek obciążeniowych dla 8-latka ze skrajną nadruchliwością i deficytem uwagi.",
    "notes": "Przekazano wskazówki doboru wagi kołderki obciążeniowej (10-15% masy ciała dziecka).",
    "durationMinutes": 35,
    "createdAt": "2026-07-12T10:15:00.000Z"
  },
  {
    "id": "rec-66",
    "callerId": "caller-9",
    "callDate": "2026-07-11T14:20:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "osoba dorosła"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "prawo pracy",
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Dodatkowy urlop wypoczynkowy (10 dni) oraz skrócony czas pracy (7h dziennie) dla pracownika z umiarkowanym stopniem niepełnosprawności.",
    "notes": "Poinformowano o obowiązku przedłożenia pracodawcy orzeczenia oraz uprawnieniu do płatnych zwolnień na turnus.",
    "durationMinutes": 30,
    "createdAt": "2026-07-11T14:50:00.000Z"
  },
  {
    "id": "rec-67",
    "callerId": "caller-10",
    "callDate": "2026-07-10T11:30:00.000Z",
    "specialistId": "spec-1",
    "specialistName": "mgr Joanna Mrożek",
    "specialistRole": "Koordynatorka / Psycholożka",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "w zakresie psychologii i rehabilitacji społecznej",
    "guidanceAreas": [
      "radzenie sobie z trudnymi zachowaniami w domu",
      "sytuacje kryzysowe"
    ],
    "adviceDescription": "Praca nad autostymulacjami (stimming) - kiedy są korzystną autoregulacją, a kiedy wymagają bezpiecznego przekierowania.",
    "notes": "Zalecono akceptację bezpiecznych form stimmingu (trzepotanie dłońmi, bujanie) i wyposażenie dziecka w gryzaki sensoryczne.",
    "durationMinutes": 40,
    "createdAt": "2026-07-10T12:10:00.000Z"
  },
  {
    "id": "rec-68",
    "callerId": "caller-11",
    "callDate": "2026-07-09T16:00:00.000Z",
    "specialistId": "spec-4",
    "specialistName": "mgr Tomasz Lewandowski",
    "specialistRole": "Konsultant Społeczny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "społeczne",
    "guidanceAreas": [
      "wsparcie instytucjonalne",
      "przebieg diagnostyki"
    ],
    "adviceDescription": "Wsparcie asystenta rodziny oraz pracownika socjalnego z GOPS dla rodziny z trojgiem dzieci, w tym dwojgiem w spektrum.",
    "notes": "Wyjaśniono zasady współpracy z asystentem rodziny i sporządzania planu pracy z rodziną.",
    "durationMinutes": 35,
    "createdAt": "2026-07-09T16:35:00.000Z"
  },
  {
    "id": "rec-69",
    "callerId": "caller-12",
    "callDate": "2026-07-08T10:10:00.000Z",
    "specialistId": "spec-admin",
    "specialistName": "dr Michał Adamczyk (Admin)",
    "specialistRole": "Administrator Systemu / Koordynator",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "organizowanie kształcenia dzieci i uczniów z ASD"
    ],
    "adviceDescription": "Procedura odwołania do Kuratorium Oświaty w związku z odmową realizacji zaleceń orzeczenia o kształceniu specjalnym.",
    "notes": "Przygotowano szkic wniosku o przeprowadzenie kontroli doraźnej przez wizytatora kuratorium.",
    "durationMinutes": 45,
    "createdAt": "2026-07-08T10:55:00.000Z"
  },
  {
    "id": "rec-70",
    "callerId": "caller-13",
    "callDate": "2026-07-07T13:25:00.000Z",
    "specialistId": "spec-3",
    "specialistName": "dr Barbara Wiśniewska",
    "specialistRole": "Pedagożka / Doradca Rodzinny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "Parent to Parent",
    "guidanceAreas": [
      "oddziaływania wychowawcze/grupy wsparcia dla rodziców",
      "doświadczenie rodzicielskie - adaptacja szkolna"
    ],
    "adviceDescription": "Wsparcie rodzeństwa dziecka z autyzmem (zespół 'szklanego dziecka'). Jak zadbać o indywidualny czas i potrzeby brata/siostry.",
    "notes": "Polecono warsztaty wsparciowe dla rodzeństwa 'Super Siostra, Super Brat' prowadzone przez fundację.",
    "durationMinutes": 40,
    "createdAt": "2026-07-07T14:05:00.000Z"
  },
  {
    "id": "rec-71",
    "callerId": "caller-14",
    "callDate": "2026-07-06T09:15:00.000Z",
    "specialistId": "spec-2",
    "specialistName": "mec. Anna Nowak",
    "specialistRole": "Radca Prawny",
    "contactTypes": [
      "telefon"
    ],
    "subjectTargets": [
      "dziecko"
    ],
    "guidanceType": "prawno-obywatelskie",
    "guidanceAreas": [
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"
    ],
    "adviceDescription": "Renta socjalna z ZUS dla osoby pełnoletniej z autyzmem powstałym przed ukończeniem 18 roku życia. Warunki badania przez lekarza orzecznika.",
    "notes": "Przeanalizowano wniosek N-9 oraz dokumentację historii leczenia i terapii od wczesnego dzieciństwa.",
    "durationMinutes": 45,
    "createdAt": "2026-07-06T10:00:00.000Z"
  }
];
