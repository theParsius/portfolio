import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import { projects } from './content/projects';
import { site } from './content/site';
import { esc, STATUS_LABEL, yearsLabel } from './lib/format';

// M1 placeholder: proves content, fonts, base path and deploy. Replaced by views/ in M2.
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app missing');
app.innerHTML = `
  <main style="max-width:760px;margin:0 auto;padding:64px 24px">
    <h1 style="font:700 clamp(50px,9vw,96px)/.92 var(--font-display);color:var(--pink);text-shadow:5px 5px 0 var(--peri);margin:0 0 22px">${esc(site.name)}</h1>
    <p style="font-size:20px;max-width:34ch">${esc(site.role)}</p>
    <p style="color:var(--dim)">New site under construction.</p>
    <ul style="list-style:none;padding:0;font-family:var(--font-display);font-size:20px">
      ${projects
        .map(
          (p) => `<li><span style="color:${p.color}">${esc(p.title)}</span>
            <span style="color:var(--dim);font-size:15px;margin-left:8px">${yearsLabel(p)} · ${STATUS_LABEL[p.status]}</span></li>`,
        )
        .join('')}
    </ul>
  </main>`;
