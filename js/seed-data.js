/**
 * Seed content — sourced ONLY from:
 *   (a) Dr_Fahreen_Hannan_CV.pdf  (primary source of truth)
 *   (b) photographs / clippings supplied by the site owner (assets/images/*)
 *
 * The public site shows this content until Firestore holds data
 * (see content.js). The Admin Panel can import all of it into Firestore
 * in one click ("Import starter content"), after which Firestore is the
 * single source of truth.
 *
 * `source` records where every fact came from.
 * `dateLabel` is what visitors see. `publishedAt` drives newest-first
 * ordering. Where a supplied photo carried no date, `dateNote` says so —
 * confirm those dates in the Admin Panel.
 */

const IMG = 'assets/images/';
const TH = 'assets/images/thumbs/';
const CV = 'CV (Dr_Fahreen_Hannan_CV.pdf)';

export const SEED_SITE_SETTINGS = {
  name: 'Dr. Fahreen Hannan',
  title: 'Senior Healthcare, Business Development & Partnerships Leader',
  currentRole: 'International Business Lead',
  currentOrg: 'Grameen HealthTech Limited',
  email: 'fahreenhannan84@gmail.com',
  phone: '+880 1749 615193',
  location: 'Dhaka, Bangladesh',
  whatsapp: '', // set from Admin → Site settings (digits only, e.g. 8801XXXXXXXXX)
  whatsappMessage: 'Hello Dr. Fahreen,\nI visited your website and would like to connect.',
  linkedin: 'https://www.linkedin.com/in/fahreen-hannan/',
  facebook: 'https://www.facebook.com/fahreen.hannan',
  theme: 'aqua',
  useSeedFallback: true
};

export const SEED_SEO = {
  title: 'Dr. Fahreen Hannan | Healthcare, Business Development & Partnerships Leader',
  description:
    'Dr. Fahreen Hannan is International Business Lead at Grameen HealthTech Limited and former Founder & CEO of Dhaka Cast Limited, working across digital health, public health and international partnerships.',
  ogImage: 'assets/images/og-image.jpg',
  canonicalUrl: ''
};

export const SEED_PROFILE = {
  headline: 'Clinician by training. Builder of healthcare access by choice.',
  bio: [
    'Dr. Fahreen Hannan is a healthcare and business leader whose career runs from clinical dentistry to hospital management, digital health, and international partnerships.',
    'As International Business Lead at Grameen HealthTech Limited, she leads international and public partnership initiatives with NGOs, donor agencies, government entities and private-sector organisations, designing scalable models that widen access to healthcare.',
    'Before that she founded Dhaka Cast Limited and led it as Founder & CEO, building an end-to-end digital healthcare platform that connected patients with doctors, diagnostics and emergency care, and enabled thousands of online consultations.',
    'She pairs her clinical training (BDS) with a Master of Public Health in Hospital Management, and a record of programme management, stakeholder engagement and cross-functional leadership across healthcare, technology and education.'
  ],
  focusAreas: [
    'Healthcare & hospital management',
    'Digital health & HealthTech',
    'Public health',
    'Business development & growth',
    'Strategic & international partnerships',
    'Government, NGO & donor engagement',
    'Programme & project management',
    'Health education & training'
  ],
  portraitUrl: IMG + 'portrait.jpg',
  portraitCaption: 'Speaking at a Shukhee event',
  languages: ['English', 'Bengali'],
  source: CV
};

/* ---------------------------------------------------------------- */
/* Experience                                                        */
/* ---------------------------------------------------------------- */
export const SEED_EXPERIENCES = [
  {
    id: 'grameen-healthtech',
    title: 'International Business Lead',
    organization: 'Grameen HealthTech Limited',
    location: 'Dhaka, Bangladesh',
    period: 'October 2024 – Present',
    current: true,
    category: 'Digital Health',
    description:
      'Leads international and public partnership initiatives to advance inclusive digital health ecosystems.',
    bullets: [
      'Lead international and public partnership initiatives to advance inclusive digital health ecosystems, engaging NGOs, donor agencies, government entities and private-sector organizations.',
      'Design scalable healthcare access models in collaboration with cross-sector stakeholders.',
      'Direct integration of healthcare service packages within the Shukhee digital health platform, improving healthcare access for underprivileged populations.',
      'Lead strategic planning, proposal development and cross-functional coordination for B2B healthcare programmes.',
      'Represent the organization in global digital health forums and innovation platforms, strengthening international visibility and partnerships.'
    ],
    publishedAt: '2024-10-01',
    source: CV
  },
  {
    id: 'dhaka-cast',
    title: 'Founder & Chief Executive Officer',
    organization: 'Dhaka Cast Limited',
    location: 'Dhaka, Bangladesh',
    period: 'December 2019 – September 2024',
    category: 'Entrepreneurship',
    description:
      'Founded and scaled an end-to-end digital healthcare platform connecting patients with doctors, diagnostics and emergency care services.',
    bullets: [
      'Founded and scaled an end-to-end digital healthcare platform connecting patients with doctors, diagnostics and emergency care services.',
      'Led cross-functional teams across technology, operations, marketing and customer support, building the business from platform development through service delivery.',
      'Developed digital health tools for diabetes and chronic disease management, enabling thousands of online consultations.',
      'Drove stakeholder engagement across the healthcare ecosystem to support platform growth and adoption.',
      'Achieved national and international recognition, including the National Digital Award and She Loves Tech.'
    ],
    publishedAt: '2019-12-01',
    source: CV
  },
  {
    id: 'jbfnc',
    title: 'Course Instructor, Behavioral & Communication Skills',
    organization: 'Japan Bangladesh Friendship Nursing College',
    location: 'Dhaka, Bangladesh',
    period: 'October 2018 – November 2019',
    category: 'Education',
    description: 'Taught communication, ethics and patient handling to nursing students.',
    bullets: [
      'Delivered specialized training in communication, ethics and patient handling to nursing students.',
      'Developed interactive curriculum, assessments, group activities and workshops to strengthen professional communication in clinical settings.'
    ],
    publishedAt: '2018-10-01',
    source: CV
  },
  {
    id: 'gp-accelerator',
    title: 'Community Builder, Grameenphone Accelerator Program',
    organization: 'Grameenphone Ltd.',
    location: 'Dhaka, Bangladesh',
    period: '2018',
    category: 'Startup Ecosystem',
    description: 'Selected as Community Builder for the Dhaka zone to support early-stage startups.',
    bullets: [
      'Selected as Community Builder for the Dhaka zone to support early-stage startups under the Grameenphone Accelerator Program.',
      'Connected startup founders with healthcare and technology networks, facilitating partnerships and collaboration with local stakeholders.'
    ],
    imageUrl: IMG + 'gp-accelerator-community-builder.jpg',
    publishedAt: '2018-06-01',
    source: CV
  },
  {
    id: 'marks-dental',
    title: 'Lecturer, Dental Unit',
    organization: 'Marks Medical and Dental College & Hospital',
    location: 'Dhaka, Bangladesh',
    period: 'April 2011 – April 2012',
    category: 'Academia',
    description: 'Taught clinical dentistry and supervised undergraduate students on clinical rounds.',
    bullets: [
      'Provided academic instruction in clinical dentistry and supervised undergraduate students during clinical rounds.',
      'Designed and evaluated theoretical and practical examinations and contributed to academic development plans.'
    ],
    publishedAt: '2011-04-01',
    source: CV
  },
  {
    id: 'dhaka-dental',
    title: 'Honorary Medical Officer',
    organization: 'Dhaka Dental College & Hospital',
    location: 'Dhaka, Bangladesh',
    period: '2010 – 2011',
    category: 'Clinical',
    description: 'Outpatient and inpatient dental care as part of the academic medical team.',
    bullets: [
      'Provided outpatient and inpatient dental care as part of the academic medical team, assisting senior physicians and surgeons in dental surgery, oral medicine and emergency care.',
      'Counseled patients on preventive oral health and supported treatment planning, patient records, and academic case presentations and research activities.'
    ],
    publishedAt: '2010-01-01',
    source: CV
  }
];

/* ---------------------------------------------------------------- */
/* Awards & recognition                                              */
/* ---------------------------------------------------------------- */
export const SEED_AWARDS = [
  {
    id: 'national-digital-award-2021',
    title: 'National Digital Award, Best Team',
    issuer: 'ICT Division, Government of Bangladesh',
    dateLabel: '12 December 2021',
    year: '2021',
    category: 'National',
    description:
      'Digital Bangladesh Award 2021 at national level (general, private sector: best team), conferred on Fahreen Hannan as Founder of Dhaka Cast and team leader.',
    content:
      'The certificate, issued by the Government of the People’s Republic of Bangladesh on 12 December 2021, recognises an outstanding contribution to the information and communication technology sector. It names Fahreen Hannan, Founder of Dhaka Cast, as team leader in the team category of the Digital Bangladesh Award 2021, conferred by the ICT Division.',
    imageUrl: IMG + 'digital-bangladesh-award-2021-certificate.jpg',
    thumbUrl: TH + 'digital-bangladesh-award-2021-certificate.jpg',
    images: [IMG + 'digital-bangladesh-award-2021-certificate.jpg', IMG + 'digital-bangladesh-award-2021-stage.jpg'],
    featured: true,
    publishedAt: '2021-12-12',
    source: CV + '; award certificate image'
  },
  {
    id: 'she-loves-tech-2019',
    title: 'She Loves Tech, Winner',
    issuer: 'She Loves Tech Global Startup Competition',
    dateLabel: '2019',
    year: '2019',
    location: 'Beijing, China',
    category: 'International',
    description: 'First Bangladeshi winner of She Loves Tech, in Beijing, China.',
    content:
      'She Loves Tech runs a global startup competition and international conference for women-led and women-impacting technology. Dr. Fahreen Hannan, then Founder of Dhaka Cast Ltd., pitched on the She Loves Tech 2019 stage in Beijing and became the first Bangladeshi winner.',
    quote:
      'We are trying to help people through our startup in an innovative way, I hope that I can create a great example to the women in our country.',
    imageUrl: IMG + 'she-loves-tech-2019-pitch.jpg',
    thumbUrl: TH + 'she-loves-tech-2019-pitch.jpg',
    images: [IMG + 'she-loves-tech-2019-pitch.jpg', IMG + 'she-loves-tech-2019-finalists.jpg', IMG + 'she-loves-tech-feature-card.jpg'],
    featured: true,
    publishedAt: '2019-09-01',
    dateNote: 'Year from CV; exact date not in source material.',
    source: CV + '; event photographs'
  },
  {
    id: 'act-covid19-honorable-mention',
    title: 'Honorable Mention, Call for Nation',
    issuer: 'ICT Division, Government of Bangladesh',
    dateLabel: '8 June 2020',
    year: '2020',
    category: 'National',
    description:
      'ACT COVID-19 National Call, category Health Care Equipment & Treatment, for Dhaka Cast’s online live video consultation platform with specialist doctors.',
    content:
      'Awarded under the “ACT COVID-19 National Call” on the Call for Nation platform. The submission, by Dr. Fahreen Hannan & Team, was “Dhaka Cast – An online live video consultancy platform for patients by specialist doctors during COVID-19”, in the Health Care Equipment & Treatment category.',
    imageUrl: IMG + 'act-covid19-honorable-mention.jpg',
    thumbUrl: TH + 'act-covid19-honorable-mention.jpg',
    images: [IMG + 'act-covid19-honorable-mention.jpg'],
    publishedAt: '2020-06-08',
    source: CV + '; certificate image'
  },
  {
    id: 'foundry-2019',
    title: 'Foundry Women Business Growth Program',
    issuer: 'Foundry',
    dateLabel: '2019',
    year: '2019',
    location: 'Mumbai, India',
    category: 'International',
    description: 'Women Business Growth Program in Mumbai, India.',
    content: 'Listed under Awards & Recognition in Dr. Fahreen Hannan’s CV: Foundry Women Business Growth Program, Mumbai, India (2019).',
    publishedAt: '2019-06-01',
    dateNote: 'Year from CV; exact date not in source material.',
    source: CV
  },
  {
    id: 'employee-of-the-quarter',
    title: 'Employee of the Quarter, Q4 2025–26',
    issuer: 'Grameen HealthTech Limited | Shukhee',
    dateLabel: 'Q4 2025–26',
    year: '2026',
    category: 'Organisational',
    description:
      'Recognised by Grameen HealthTech Limited and Shukhee “for your contribution”, alongside the “5 Million Smiles & Counting” commemorative medal.',
    content:
      'A crystal plaque from Grameen HealthTech Limited and Shukhee names Dr. Fahreen Hannan Employee of the Quarter for Q4 2025–26 with thanks for her contribution. It is pictured with a “5 Million Smiles & Counting” medal bearing her name.',
    imageUrl: IMG + 'grameen-healthtech-recognition.jpg',
    thumbUrl: TH + 'grameen-healthtech-recognition.jpg',
    images: [IMG + 'grameen-healthtech-recognition.jpg'],
    publishedAt: '2026-07-01',
    dateNote: 'Quarter from the plaque; exact presentation date not in source material.',
    source: 'Award photograph supplied by site owner'
  }
];

/* ---------------------------------------------------------------- */
/* Activities                                                        */
/* ---------------------------------------------------------------- */
export const SEED_ACTIVITIES = [
  {
    id: 'coxs-bazar-roundtable-2026',
    title: 'Presenting at a Cox’s Bazar roundtable on integrated healthcare',
    category: 'Healthcare',
    dateLabel: '30 September 2026',
    location: 'Cox’s Bazar, Bangladesh',
    description:
      'Grameen HealthTech (Shukhee) and OPCA convened government, UN agencies and humanitarian organisations to advance connected, integrated and sustainable healthcare. Dr. Fahreen Hannan presented an overview of the health situation among the FDMN population and local communities.',
    content:
      'The roundtable took place at the RRRC conference room in the Baharchhara area of Cox’s Bazar town, jointly organised by Grameen HealthTech Limited (Shukhee) and OPCA. Representatives of the Refugee Relief and Repatriation Commissioner, UN agencies and humanitarian organisations attended alongside the Cox’s Bazar Civil Surgeon.\n\nDr. Fahreen Hannan presented an overview of the health situation among the Forcibly Displaced Myanmar Nationals (FDMN) population and local communities. Participants discussed service gaps and stressed the need for coordinated initiatives.\n\nThe Bangladesh Post report (2 October 2026) identifies her as Head of International Partnerships at Grameen Healthtech.',
    imageUrl: IMG + 'coxs-bazar-roundtable-somoy.jpg',
    thumbUrl: TH + 'coxs-bazar-roundtable-somoy.jpg',
    images: [IMG + 'coxs-bazar-roundtable-somoy.jpg', IMG + 'bangladesh-post-coxs-bazar-2026.jpg'],
    externalUrl: 'https://www.bangladeshpost.net/',
    sourceLabel: 'Bangladesh Post, 2 October 2026',
    featured: true,
    publishedAt: '2026-09-30',
    source: 'Bangladesh Post clipping supplied by site owner'
  },
  {
    id: 'employee-of-the-quarter-activity',
    title: 'Named Employee of the Quarter at Grameen HealthTech',
    category: 'Award',
    dateLabel: 'Q4 2025–26',
    description: 'Recognition from Grameen HealthTech Limited and Shukhee for her contribution.',
    content:
      'Grameen HealthTech Limited and Shukhee named Dr. Fahreen Hannan Employee of the Quarter for Q4 2025–26. The recognition is pictured with the “5 Million Smiles & Counting” medal bearing her name.',
    imageUrl: IMG + 'grameen-healthtech-recognition.jpg',
    thumbUrl: TH + 'grameen-healthtech-recognition.jpg',
    publishedAt: '2026-07-01',
    dateNote: 'Quarter from the plaque; exact date not in source material.',
    source: 'Award photograph supplied by site owner'
  },
  {
    id: 'digital-bangladesh-award-2021-activity',
    title: 'Receiving the Digital Bangladesh Award 2021',
    category: 'Award',
    dateLabel: '12 December 2021',
    description: 'Best Team at national level, conferred by the ICT Division on Dhaka Cast with Fahreen Hannan as team leader.',
    content:
      'The Digital Bangladesh Award 2021 (national level, general: private sector, best team) recognised Dhaka Cast’s contribution to the ICT sector, naming its founder Fahreen Hannan as team leader.',
    imageUrl: IMG + 'digital-bangladesh-award-2021-stage.jpg',
    thumbUrl: TH + 'digital-bangladesh-award-2021-stage.jpg',
    images: [IMG + 'digital-bangladesh-award-2021-stage.jpg', IMG + 'digital-bangladesh-award-2021-certificate.jpg'],
    publishedAt: '2021-12-12',
    source: 'Award certificate supplied by site owner; CV'
  },
  {
    id: 'digital-world-2020',
    title: 'Exhibitor at Digital World 2020',
    category: 'Digital Health',
    dateLabel: '2020',
    description: 'Exhibitor recognition at Digital World 2020, themed “Socially distanced, digitally connected”.',
    content:
      'Dr. Fahreen Hannan’s team took part in Digital World 2020 as an exhibitor. The exhibitor trophy carries the event theme “Socially distanced, digitally connected”.',
    imageUrl: IMG + 'digital-world-2020-exhibitor.jpg',
    thumbUrl: TH + 'digital-world-2020-exhibitor.jpg',
    publishedAt: '2020-12-01',
    dateNote: 'Year from the trophy; exact date not in source material.',
    source: 'Trophy photograph supplied by site owner'
  },
  {
    id: 'act-covid19-activity',
    title: 'Honorable Mention in the ACT COVID-19 National Call',
    category: 'Award',
    dateLabel: '8 June 2020',
    description: 'Dhaka Cast’s live video consultation platform with specialist doctors recognised during the COVID-19 response.',
    content:
      'On the Call for Nation platform of the ICT Division, the “ACT COVID-19 National Call” gave an Honorable Mention to Dhaka Cast, an online live video consultancy platform for patients by specialist doctors, submitted by Dr. Fahreen Hannan & Team.',
    imageUrl: IMG + 'act-covid19-honorable-mention.jpg',
    thumbUrl: TH + 'act-covid19-honorable-mention.jpg',
    publishedAt: '2020-06-08',
    source: 'Certificate image supplied by site owner; CV'
  },
  {
    id: 'she-loves-tech-2019-activity',
    title: 'Pitching on the She Loves Tech 2019 stage in Beijing',
    category: 'Conference',
    dateLabel: '2019',
    location: 'Beijing, China',
    description: 'She Loves Tech 2019 Global Startup Competition & International Conference, where she became the first Bangladeshi winner.',
    content:
      'Dr. Fahreen Hannan represented Dhaka Cast at the She Loves Tech 2019 Global Startup Competition & International Conference in Beijing, China. Her CV records her as the competition’s first Bangladeshi winner.',
    imageUrl: IMG + 'she-loves-tech-2019-pitch.jpg',
    thumbUrl: TH + 'she-loves-tech-2019-pitch.jpg',
    images: [IMG + 'she-loves-tech-2019-pitch.jpg', IMG + 'she-loves-tech-2019-finalists.jpg'],
    publishedAt: '2019-09-01',
    dateNote: 'Year from CV and stage signage; exact date not in source material.',
    source: CV + '; event photographs'
  },
  {
    id: 'foundry-2019-activity',
    title: 'Foundry Women Business Growth Program in Mumbai',
    category: 'Business',
    dateLabel: '2019',
    location: 'Mumbai, India',
    description: 'Took part in the Foundry Women Business Growth Program, Mumbai, India.',
    content: 'Recorded in her CV under Awards & Recognition: Foundry Women Business Growth Program, Mumbai, India (2019).',
    publishedAt: '2019-06-01',
    dateNote: 'Year from CV.',
    source: CV
  },
  {
    id: 'gp-accelerator-2018',
    title: 'Community Builder for the Grameenphone Accelerator',
    category: 'Community',
    dateLabel: '2018',
    location: 'Dhaka, Bangladesh',
    description: 'Selected as Community Builder for the Dhaka zone of GP Accelerator 2.0, supporting early-stage startups.',
    content:
      'Selected as Community Builder for the Dhaka zone to support early-stage startups under the Grameenphone Accelerator Program, connecting founders with healthcare and technology networks.',
    imageUrl: IMG + 'gp-accelerator-community-builder.jpg',
    thumbUrl: TH + 'gp-accelerator-community-builder.jpg',
    publishedAt: '2018-06-01',
    source: CV + '; programme announcement image'
  },
  {
    id: 'mou-kumudini',
    title: 'MOU signing between Kumudini Welfare Trust and Dhaka Cast',
    category: 'Partnership',
    dateLabel: 'Dhaka Cast years',
    description: 'Memorandum of understanding between Kumudini Welfare Trust of Bengal (BD) Ltd (SCIP Project) and Dhaka Cast Limited.',
    content:
      'A signing ceremony for a memorandum of understanding between Kumudini Welfare Trust of Bengal (BD) Ltd, SCIP Project, and Dhaka Cast Limited, with Dr. Fahreen Hannan signing for Dhaka Cast.',
    imageUrl: IMG + 'mou-kumudini-dhaka-cast.jpg',
    thumbUrl: TH + 'mou-kumudini-dhaka-cast.jpg',
    publishedAt: '2022-01-01',
    dateNote: 'Date not in source material — set the real date in Admin.',
    source: 'Event banner photograph supplied by site owner'
  },
  {
    id: 'bridge-for-billions-mentor',
    title: 'Mentor with Bridge for Billions',
    category: 'Community',
    dateLabel: 'Bridge for Billions',
    description: 'Certificate recognising her as a valued Bridge for Billions mentor who supported a venture through its incubation program.',
    content:
      'Bridge for Billions is an online incubator providing entrepreneurs with training, business mentorship and tools. Its certificate thanks Fahreen Hannan for being a valued mentor and for supporting a venture through the incubation program. Earlier, in 2020, she completed the six-month Accelerate Bangladesh programme with Bridge for Billions (CV).',
    imageUrl: IMG + 'bridge-for-billions-mentor.jpg',
    thumbUrl: TH + 'bridge-for-billions-mentor.jpg',
    publishedAt: '2021-01-01',
    dateNote: 'Certificate date not legible in supplied image — set the real date in Admin.',
    source: 'Certificate image supplied by site owner'
  }
];

/* ---------------------------------------------------------------- */
/* Media / press                                                     */
/* ---------------------------------------------------------------- */
export const SEED_MEDIA = [
  {
    id: 'bangladesh-post-2026-10-02',
    publication: 'Bangladesh Post',
    title: 'Roundtable held in Cox’s Bazar to advance integrated healthcare',
    category: 'News',
    dateLabel: '2 October 2026',
    description:
      'Report on the Grameen HealthTech (Shukhee) and OPCA roundtable with government, UN and humanitarian representatives, noting Dr. Fahreen Hannan’s overview of the health situation among the FDMN population and local communities.',
    imageUrl: IMG + 'bangladesh-post-coxs-bazar-2026.jpg',
    thumbUrl: TH + 'bangladesh-post-coxs-bazar-2026.jpg',
    externalUrl: 'https://www.bangladeshpost.net/',
    publishedAt: '2026-10-02',
    source: 'Print clipping supplied by site owner'
  },
  {
    id: 'somoy-coxs-bazar-2026',
    publication: 'Somoy',
    title: 'At the Cox’s Bazar healthcare roundtable',
    category: 'News',
    dateLabel: 'September 2026',
    description: 'Photograph carrying the Somoy logo, showing Dr. Fahreen Hannan presenting at the roundtable.',
    imageUrl: IMG + 'coxs-bazar-roundtable-somoy.jpg',
    thumbUrl: TH + 'coxs-bazar-roundtable-somoy.jpg',
    externalUrl: '',
    publishedAt: '2026-09-30',
    source: 'Image supplied by site owner — add the article link in Admin'
  },
  {
    id: 'feature-bn-2019',
    publication: 'Bangla daily (feature by Mahbub Nahid)',
    title: 'যুদ্ধ জয়ে অনন্য ফাহরিন',
    category: 'Feature',
    dateLabel: '2019',
    description:
      'A Bengali-language profile tracing her path from dentistry into public health and entrepreneurship, and the founding of Dhaka Cast to help people living with diabetes.',
    imageUrl: IMG + 'press-feature-bn-2019.jpg',
    thumbUrl: TH + 'press-feature-bn-2019.jpg',
    externalUrl: '',
    publishedAt: '2019-05-01',
    dateNote: 'Publication and date not printed on the clipping — confirm in Admin.',
    source: 'Print clipping supplied by site owner'
  }
];

/* ---------------------------------------------------------------- */
/* Gallery                                                           */
/* ---------------------------------------------------------------- */
const g = (id, title, category, file, publishedAt, extra = {}) => ({
  id, title, category, imageUrl: IMG + file, thumbUrl: TH + file, publishedAt, ...extra
});
export const SEED_GALLERY = [
  g('g-roundtable', 'Presenting at the Cox’s Bazar healthcare roundtable', 'Healthcare', 'coxs-bazar-roundtable-somoy.jpg', '2026-09-30'),
  g('g-recognition', 'Employee of the Quarter plaque and “5 Million Smiles” medal', 'Awards', 'grameen-healthtech-recognition.jpg', '2026-07-01'),
  g('g-shukhee-team', 'With colleagues at Shukhee', 'Team', 'shukhee-team.jpg', '2026-01-02'),
  g('g-speaking-shukhee', 'Speaking at a Shukhee event', 'Speaking', 'speaking-shukhee.jpg', '2026-01-01'),
  g('g-training', 'With participants at a healthcare training session', 'Healthcare', 'healthcare-training-session.jpg', '2025-06-01'),
  g('g-conference', 'At a conference', 'Events', 'conference-moment.jpg', '2025-01-01'),
  g('g-dba-stage', 'Digital Bangladesh Award 2021', 'Awards', 'digital-bangladesh-award-2021-stage.jpg', '2021-12-12'),
  g('g-dba-cert', 'Digital Bangladesh Award 2021 certificate', 'Awards', 'digital-bangladesh-award-2021-certificate.jpg', '2021-12-12'),
  g('g-mou', 'MOU signing: Kumudini Welfare Trust and Dhaka Cast', 'Professional', 'mou-kumudini-dhaka-cast.jpg', '2022-01-01'),
  g('g-digital-world', 'Digital World 2020 exhibitor trophy', 'Awards', 'digital-world-2020-exhibitor.jpg', '2020-12-01'),
  g('g-act', 'ACT COVID-19 Honorable Mention', 'Awards', 'act-covid19-honorable-mention.jpg', '2020-06-08'),
  g('g-emk', 'Speaking at the EMK Center as Founder of Dhaka Cast', 'Speaking', 'emk-center-dhaka-cast.jpg', '2019-10-01'),
  g('g-slt-pitch', 'On stage at She Loves Tech 2019', 'International', 'she-loves-tech-2019-pitch.jpg', '2019-09-02'),
  g('g-slt-group', 'She Loves Tech 2019 Global Startup Competition', 'International', 'she-loves-tech-2019-finalists.jpg', '2019-09-01'),
  g('g-slt-card', 'She Loves Tech feature card', 'International', 'she-loves-tech-feature-card.jpg', '2019-08-30'),
  g('g-gpa', 'Community Builder, GP Accelerator 2.0', 'Community', 'gp-accelerator-community-builder.jpg', '2018-06-01'),
  g('g-bfb', 'Bridge for Billions mentor certificate', 'Community', 'bridge-for-billions-mentor.jpg', '2021-01-01')
];

/* ---------------------------------------------------------------- */
/* Education / research / training                                   */
/* ---------------------------------------------------------------- */
export const SEED_EDUCATION = [
  {
    id: 'mph-nsu',
    title: 'Master of Public Health (MPH)',
    field: 'Hospital Management',
    institution: 'North South University',
    year: '2011',
    detail: 'CGPA 3.91 / 4.00',
    publishedAt: '2011-12-01',
    source: CV
  },
  {
    id: 'bds-du',
    title: 'Bachelor of Dental Surgery (BDS)',
    field: 'Dental Surgery',
    institution: 'University of Dhaka',
    year: '2007',
    detail: '',
    publishedAt: '2007-12-01',
    source: CV
  }
];

export const SEED_RESEARCH = [
  {
    id: 'smoking-young-males',
    title: 'Effect of Smoking in Young Male Smokers',
    category: 'Thesis',
    institution: 'North South University, Dhaka',
    year: '2011',
    publishedAt: '2011-06-01',
    source: CV
  },
  {
    id: 'passive-smoking-lung-cancer',
    title: 'Passive Smoking Causes Lung Cancer',
    category: 'Thesis',
    institution: 'North South University, Dhaka',
    year: '2010',
    publishedAt: '2010-06-01',
    source: CV
  }
];

export const SEED_TRAINING = [
  {
    id: 'covid-accelerator',
    title: 'Covid Accelerator',
    description: 'Creating Sustainable Business During Pandemic',
    institution: 'Bangladesh Hi-Tech Park Authority',
    year: '2020',
    duration: '4 months',
    publishedAt: '2020-08-01',
    source: CV
  },
  {
    id: 'accelerate-bangladesh',
    title: 'Accelerate Bangladesh',
    description: 'Innovation & Entrepreneurship',
    institution: 'Bridge for Billions',
    year: '2020',
    duration: '6 months',
    publishedAt: '2020-07-01',
    source: CV
  },
  {
    id: 'british-council',
    title: 'General English (B1–B3)',
    description: 'English language programme',
    institution: 'British Council Bangladesh',
    year: '2012',
    duration: '2 months',
    publishedAt: '2012-06-01',
    source: CV
  }
];

/* ---------------------------------------------------------------- */
/* Narrative structures (not CMS collections)                        */
/* ---------------------------------------------------------------- */
export const JOURNEY = [
  {
    year: '2010',
    title: 'Clinical foundation',
    summary: 'Honorary Medical Officer at Dhaka Dental College & Hospital, after a BDS from the University of Dhaka (2007).',
    detail: [
      'Bachelor of Dental Surgery, University of Dhaka, 2007.',
      'Honorary Medical Officer, Dhaka Dental College & Hospital (2010–2011): outpatient and inpatient dental care, assisting in dental surgery, oral medicine and emergency care.',
      'Counselled patients on preventive oral health and supported treatment planning, case presentations and research.'
    ],
    link: '#experience'
  },
  {
    year: '2011',
    title: 'Public health',
    summary: 'MPH in Hospital Management at North South University, CGPA 3.91, and a lectureship in clinical dentistry.',
    detail: [
      'Master of Public Health, Hospital Management, North South University (2011), CGPA 3.91 / 4.00.',
      'Theses on the effect of smoking in young male smokers (2011) and passive smoking and lung cancer (2010).',
      'Lecturer, Dental Unit, Marks Medical and Dental College & Hospital (2011–2012).'
    ],
    link: '#education'
  },
  {
    year: '2018',
    title: 'Health education & the startup ecosystem',
    summary: 'Teaching communication and ethics to nursing students, and supporting founders as a GP Accelerator Community Builder.',
    detail: [
      'Course Instructor, Behavioral & Communication Skills, Japan Bangladesh Friendship Nursing College (Oct 2018 – Nov 2019).',
      'Community Builder for the Dhaka zone, Grameenphone Accelerator Program (2018): connected founders with healthcare and technology networks.'
    ],
    link: '#experience'
  },
  {
    year: '2019',
    title: 'Dhaka Cast, Founder & CEO',
    summary: 'Building an end-to-end digital healthcare platform, recognised at home and abroad.',
    detail: [
      'Founder & CEO, Dhaka Cast Limited (Dec 2019 – Sep 2024).',
      'Digital health tools for diabetes and chronic disease management, enabling thousands of online consultations.',
      'She Loves Tech winner, Beijing (2019); ACT COVID-19 Honorable Mention (2020); National Digital Award, Best Team (2021).'
    ],
    link: '#dhaka-cast'
  },
  {
    year: '2024',
    title: 'Grameen HealthTech',
    summary: 'Joining Grameen HealthTech Limited as International Business Lead.',
    detail: [
      'International Business Lead, Grameen HealthTech Limited, from October 2024.',
      'Directing the integration of healthcare service packages within the Shukhee digital health platform.'
    ],
    link: '#experience'
  },
  {
    year: 'Present',
    title: 'International business & partnerships',
    summary: 'Leading partnerships with NGOs, donor agencies, government and the private sector for inclusive healthcare access.',
    detail: [
      'Designing scalable healthcare access models with cross-sector stakeholders.',
      'Leading strategic planning, proposal development and coordination for B2B healthcare programmes.',
      'Representing the organisation in global digital health forums and innovation platforms.'
    ],
    link: '#ecosystem'
  }
];

export const CASE_STUDY = [
  {
    step: 'Problem',
    text: 'Diabetes and other chronic conditions need continuing care, yet reaching the right doctor, test or emergency service is hard to do consistently.',
    note: 'Dhaka Cast’s own line: “It’s all about diabetes.”'
  },
  {
    step: 'Idea',
    text: 'One digital front door that connects patients with doctors, diagnostics and emergency care services.',
    image: 'emk-center-dhaka-cast.jpg',
    caption: 'Speaking for Dhaka Cast at the EMK Center'
  },
  {
    step: 'Platform',
    text: 'An end-to-end digital healthcare platform with online live video consultations with specialist doctors, a service that mattered most during COVID-19.'
  },
  {
    step: 'Healthcare services',
    text: 'Digital health tools for diabetes and chronic disease management, alongside doctor, diagnostic and emergency care connections.'
  },
  {
    step: 'Growth',
    text: 'Cross-functional teams across technology, operations, marketing and customer support, plus partnerships such as the MOU with Kumudini Welfare Trust of Bengal (BD) Ltd, SCIP Project.',
    image: 'mou-kumudini-dhaka-cast.jpg',
    caption: 'MOU signing with Kumudini Welfare Trust (SCIP Project)'
  },
  {
    step: 'Impact',
    text: 'Thousands of online consultations enabled through the platform’s digital health tools.'
  },
  {
    step: 'Recognition',
    text: 'She Loves Tech winner (Beijing, 2019), ACT COVID-19 Honorable Mention (2020), Digital World 2020 exhibitor, and the National Digital Award for Best Team (2021).',
    image: 'digital-bangladesh-award-2021-certificate.jpg',
    caption: 'Digital Bangladesh Award 2021 certificate'
  }
];

export const ECOSYSTEM = [
  { id: 'healthcare', label: 'Healthcare', text: 'Healthcare service packages integrated into the Shukhee digital health platform to improve access for underprivileged populations.' },
  { id: 'technology', label: 'Technology', text: 'A HealthTech career: from building Dhaka Cast’s platform to directing service integration on Shukhee.' },
  { id: 'government', label: 'Government', text: 'Partnership initiatives that engage government entities; recognised by the ICT Division in 2020 and 2021.' },
  { id: 'ngos', label: 'NGOs', text: 'Partnership initiatives with NGOs, such as the Cox’s Bazar roundtable with humanitarian organisations.' },
  { id: 'donors', label: 'Donors', text: 'Engagement with donor agencies to fund and scale inclusive digital health models.' },
  { id: 'private', label: 'Private sector', text: 'Strategic planning, proposals and coordination for B2B healthcare programmes with private-sector organisations.' },
  { id: 'communities', label: 'Communities', text: 'Health access for underprivileged populations, including the FDMN population and host communities in Cox’s Bazar.' },
  { id: 'international', label: 'International partners', text: 'Representing Grameen HealthTech in global digital health forums and innovation platforms.' }
];

/* Verified locations only (each backed by CV or supplied clipping) */
export const LOCATIONS = [
  { id: 'dhaka', name: 'Dhaka, Bangladesh', lat: 23.81, lon: 90.41, kind: 'Base', label: 'ne', text: 'Home base: Grameen HealthTech, Dhaka Cast, academic and clinical roles.', link: '#experience' },
  { id: 'coxs-bazar', name: 'Cox’s Bazar, Bangladesh', lat: 21.43, lon: 92.01, kind: 'Roundtable', label: 'se', text: 'Presented on FDMN and host-community health at the 2026 integrated healthcare roundtable.', link: '#activities', activityId: 'coxs-bazar-roundtable-2026' },
  { id: 'beijing', name: 'Beijing, China', lat: 39.9, lon: 116.4, kind: 'Award', label: 'e', text: 'She Loves Tech 2019: first Bangladeshi winner.', link: '#achievements', activityId: 'she-loves-tech-2019-activity' },
  { id: 'mumbai', name: 'Mumbai, India', lat: 19.08, lon: 72.88, kind: 'Programme', label: 'w', text: 'Foundry Women Business Growth Program, 2019.', link: '#achievements', activityId: 'foundry-2019-activity' }
];

export const SEED = {
  siteSettings: SEED_SITE_SETTINGS,
  seoSettings: SEED_SEO,
  profiles: SEED_PROFILE,
  experiences: SEED_EXPERIENCES,
  awards: SEED_AWARDS,
  activities: SEED_ACTIVITIES,
  media: SEED_MEDIA,
  gallery: SEED_GALLERY,
  education: SEED_EDUCATION,
  research: SEED_RESEARCH,
  training: SEED_TRAINING,
  articles: [],
  videos: [],
  testimonials: [],
  socialLinks: []
};
