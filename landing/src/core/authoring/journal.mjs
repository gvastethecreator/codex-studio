import { copyFileSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

function inside(root, target) {
  const base = realpathSync(root);
  const parent = realpathSync(dirname(resolve(target)));
  const prefix = base.endsWith(sep) ? base : base + sep;
  const normalParent = parent.toLowerCase();
  const normalBase = base.toLowerCase();
  return normalParent === normalBase || normalParent.startsWith(prefix.toLowerCase());
}

export function applyFilePair({ root, sitePath, templatePath, siteText, templateText, failpoint = null }) {
  const site = resolve(sitePath);
  const template = resolve(templatePath);
  if (!inside(root, site) || !inside(root, template)) {
    return { ok: false, code: "E_PATH_ESCAPE" };
  }
  const backupSite = `${site}.authoring-backup`;
  const backupTemplate = `${template}.authoring-backup`;
  const journalPath = join(dirname(site), ".authoring-journal.json");
  const originalSite = readFileSync(site);
  const originalTemplate = readFileSync(template);
  mkdirSync(dirname(site), { recursive: true });
  writeFileSync(backupSite, originalSite);
  writeFileSync(backupTemplate, originalTemplate);
  const journal = { site, template, backupSite, backupTemplate, stage: "backed-up" };
  writeFileSync(journalPath, JSON.stringify(journal));
  const siteTmp = `${site}.authoring-tmp`;
  const templateTmp = `${template}.authoring-tmp`;
  writeFileSync(siteTmp, siteText);
  writeFileSync(templateTmp, templateText);
  renameSync(siteTmp, site);
  journal.stage = "site-written";
  writeFileSync(journalPath, JSON.stringify(journal));
  if (failpoint === "second-write") {
    copyFileSync(backupSite, site);
    rmSync(templateTmp, { force: true });
    journal.stage = "rolled-back";
    journal.error = "second-write";
    writeFileSync(journalPath, JSON.stringify(journal));
    return { ok: false, code: "E_SECOND_WRITE", journalPath, backupSite, backupTemplate };
  }
  try {
    renameSync(templateTmp, template);
  } catch (error) {
    copyFileSync(backupSite, site);
    rmSync(templateTmp, { force: true });
    journal.stage = "rolled-back";
    journal.error = error instanceof Error ? error.message : "template-write";
    writeFileSync(journalPath, JSON.stringify(journal));
    return { ok: false, code: "E_SECOND_WRITE", journalPath, backupSite, backupTemplate };
  }
  journal.stage = "complete";
  writeFileSync(journalPath, JSON.stringify(journal));
  return { ok: true, journalPath, backupSite, backupTemplate };
}
