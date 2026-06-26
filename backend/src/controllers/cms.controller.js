const fs = require('fs/promises');
const path = require('path');
const { audit } = require('../services/audit.service');

const dataDir = path.join(__dirname, '../../data');
const cmsFile = path.join(dataDir, 'cms-pages.json');

const DEFAULT_PAGES = {
  about: {
    slug: 'about',
    title: 'About UptoSkills',
    body: 'UptoSkills helps learners build job-ready skills through structured courses, practical lessons, assessments, and tracked progress.',
    sections: [
      { heading: 'Why it works', body: 'Each course combines short lessons, clear progress tracking, and visible outcomes.' },
      { heading: 'Who it is for', body: 'Learners, instructors, and teams who want an organized learning experience.' },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    body: 'We use learner data to provide authentication, course progress, certificates, notifications, and support.',
    sections: [],
  },
  terms: {
    slug: 'terms',
    title: 'Terms and Conditions',
    body: 'Use of the platform is governed by our learning rules, acceptable use policy, and course access terms.',
    sections: [],
  },
  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    body: 'Find answers to the most common learner questions below.',
    sections: [
      { heading: 'How do I resume a course?', body: 'Open Dashboard and choose Continue learning.' },
      { heading: 'Where are certificates?', body: 'Completed certificates appear on the Certificates page.' },
    ],
  },
  contact: {
    slug: 'contact',
    title: 'Contact UptoSkills',
    body: 'Need help? Reach out through support or email the team for account-sensitive requests.',
    sections: [],
  },
  footer: {
    slug: 'footer',
    title: 'Footer',
    body: 'UptoSkills helps learners master in-demand skills through curated courses and role-aware workspaces.',
    sections: [
      { heading: 'Brand', body: 'UptoSkills LMS' },
      { heading: 'Support email', body: 'support@uptoskills.com' },
      { heading: 'Social', body: 'GitHub, X, LinkedIn' },
    ],
  },
};

const ensureData = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(cmsFile);
  } catch {
    await fs.writeFile(cmsFile, JSON.stringify(DEFAULT_PAGES, null, 2));
  }
};

const readPages = async () => {
  await ensureData();
  const raw = await fs.readFile(cmsFile, 'utf8');
  return JSON.parse(raw);
};

const writePages = async (pages) => {
  await ensureData();
  await fs.writeFile(cmsFile, JSON.stringify(pages, null, 2));
};

exports.getCmsPage = async (req, res, next) => {
  try {
    const pages = await readPages();
    const page = pages[req.params.slug] || DEFAULT_PAGES[req.params.slug];
    if (!page) return res.status(404).json({ success: false, error: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

exports.listCmsPages = async (_req, res, next) => {
  try {
    const pages = await readPages();
    res.json({ success: true, data: Object.values({ ...DEFAULT_PAGES, ...pages }) });
  } catch (error) {
    next(error);
  }
};

exports.upsertCmsPage = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();
    if (!slug) return res.status(400).json({ success: false, error: 'Slug is required' });
    const pages = await readPages();
    const sections = Array.isArray(req.body.sections) ? req.body.sections.slice(0, 20).map((section) => ({
      heading: String(section.heading || '').trim(),
      body: String(section.body || '').trim(),
    })).filter((section) => section.heading || section.body) : [];
    const page = {
      slug,
      title: title || DEFAULT_PAGES[slug]?.title || slug,
      body,
      sections,
      updatedAt: new Date().toISOString(),
    };
    pages[slug] = page;
    await writePages(pages);
    await audit(req, 'cms.update', 'CmsPage', slug, null, page);
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};
