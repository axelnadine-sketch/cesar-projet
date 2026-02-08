  // ==========================================
// Script principal – interactions front-end
// ==========================================

  (function(){
      const app = document.querySelector('[data-app]');
      const btnTheme = document.getElementById('btnTheme');
      const btnCopy = document.getElementById('btnCopy');
      const btnAction = document.getElementById('btnAction');
      const clicksEl = document.getElementById('clicks');
      const scoreEl = document.getElementById('score');
      const q = document.getElementById('q');
      const grid = document.getElementById('grid');

      const toast = document.getElementById('toast');
      const toastTitle = document.getElementById('toastTitle');
      const toastText = document.getElementById('toastText');
      let toastTimer = null;

      const state = {
        theme: localStorage.getItem('theme') || 'dark',
        clicks: Number(localStorage.getItem('clicks') || 0),
        score: Number(localStorage.getItem('score') || 15),
        filter: 'all',
        query: ''
      };

      const items = [
        { id: 1, cat: 'web', title: 'WordPress — page d’accueil propre', desc: 'Structure, blocs, typographie, CTA. Base solide pour un site pro.', level: 25 },
        { id: 2, cat: 'auto', title: 'n8n — premier workflow utile', desc: 'Déclencheur + filtre + action + logs. Comprendre la logique de l’automatisation.', level: 35 },
        { id: 3, cat: 'ops', title: 'VPS — dossier de projet propre', desc: 'Organisation /srv, logs, variables, services. Le réflexe “pro”.', level: 45 },
        { id: 4, cat: 'ai',  title: 'IA — prompt simple mais efficace', desc: 'Objectif, contexte, contraintes, format de sortie. Réutilisable.', level: 30 },
        { id: 5, cat: 'web', title: 'SEO — checklist rapide', desc: 'Titles, meta, Hn, maillage interne, vitesse, indexation.', level: 40 },
        { id: 6, cat: 'ai',  title: 'IA — micro-agent (simulation)', desc: 'Décomposer une tâche en étapes. Résultat clair + actions.', level: 55 },
      ];

      function showToast(title, text){
        toastTitle.textContent = title;
        toastText.textContent = text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2100);
      }

      function applyTheme(){
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
      }

      function setScore(next){
        state.score = Math.max(0, Math.min(100, next));
        scoreEl.textContent = state.score.toString();
        localStorage.setItem('score', state.score.toString());
      }

      function setClicks(next){
        state.clicks = next;
        clicksEl.textContent = state.clicks.toString();
        localStorage.setItem('clicks', state.clicks.toString());
      }

      function activeChip(value){
        document.querySelectorAll('.chip').forEach(ch => {
          const on = ch.dataset.filter === value;
          ch.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }

      function matches(item){
        const byCat = (state.filter === 'all') || (item.cat === state.filter);
        const needle = state.query.trim().toLowerCase();
        if(!needle) return byCat;
        const hay = (item.title + ' ' + item.desc).toLowerCase();
        return byCat && hay.includes(needle);
      }

      function render(){
        const filtered = items.filter(matches);
        grid.innerHTML = '';
        if(filtered.length === 0){
          const empty = document.createElement('div');
          empty.className = 'item';
          empty.innerHTML = `
            <div class="tag"><span class="badge">Aucun résultat</span></div>
            <h4>Essaie une autre recherche</h4>
            <p>Astuce : tape “VPS”, “WordPress”, “n8n” ou “IA”.</p>
            <div class="row">
              <button class="btn" type="button" id="resetBtn">Réinitialiser</button>
            </div>
          `;
          grid.appendChild(empty);
          empty.querySelector('#resetBtn').addEventListener('click', () => {
            state.query = '';
            q.value = '';
            state.filter = 'all';
            activeChip('all');
            render();
            showToast('Réinitialisé', 'Filtres et recherche remis à zéro.');
          });
          return;
        }

        for(const it of filtered){
          const el = document.createElement('article');
          el.className = 'item';
          el.setAttribute('data-cat', it.cat);

          const badgeLabel =
            it.cat === 'web' ? 'WEB' :
            it.cat === 'ops' ? 'VPS' :
            it.cat === 'auto' ? 'N8N' :
            'IA';

          el.innerHTML = `
            <div class="tag">
              <span class="badge">${badgeLabel}</span>
              <span>id:${it.id.toString().padStart(2,'0')}</span>
            </div>
            <h4>${it.title}</h4>
            <p>${it.desc}</p>
            <div class="row">
              <div class="bar" aria-label="Progression de l’item">
                <div class="fill" style="width:${Math.min(100, Math.max(8, it.level))}%"></div>
              </div>
              <button class="btn" type="button" data-boost="${it.level}">
                Booster
              </button>
            </div>
          `;

          el.querySelector('button[data-boost]').addEventListener('click', (e) => {
            const gain = Number(e.currentTarget.getAttribute('data-boost')) || 10;
            setScore(state.score + Math.round(gain / 10));
            setClicks(state.clicks + 1);
            showToast('Boost', `+${Math.round(gain/10)}% de progression.`);
          });

          grid.appendChild(el);
        }
      }

      async function copyLink(){
        const text = window.location.href;
        try{
          await navigator.clipboard.writeText(text);
          showToast('Copié', 'Lien copié dans le presse-papiers.');
        }catch{
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('Copié', 'Lien copié (mode compatibilité).');
        }
      }

      function toggleTheme(){
        state.theme = (state.theme === 'dark') ? 'light' : 'dark';
        applyTheme();
        showToast('Thème', state.theme === 'dark' ? 'Mode sombre activé.' : 'Mode clair activé.');
      }

      function action(){
        // petite animation + progression
        setClicks(state.clicks + 1);
        const bump = Math.max(3, Math.min(12, 100 - state.score));
        setScore(state.score + bump);
        showToast('Interactivité', `Progression +${bump}%. Continue.`);
      }

      // Events
      btnTheme.addEventListener('click', toggleTheme);
      btnCopy.addEventListener('click', copyLink);
      btnAction.addEventListener('click', action);

      q.addEventListener('input', () => {
        state.query = q.value;
        render();
      });

      document.querySelectorAll('.chip').forEach(ch => {
        ch.addEventListener('click', () => {
          state.filter = ch.dataset.filter;
          activeChip(state.filter);
          render();
        });
      });

      // Raccourcis clavier
      window.addEventListener('keydown', (e) => {
        if(e.key === 't' || e.key === 'T'){ toggleTheme(); }
        if(e.key === '/'){
          e.preventDefault();
          q.focus();
        }
        if(e.key === 'c' || e.key === 'C'){ copyLink(); }
      });

      // Init
      clicksEl.textContent = state.clicks.toString();
      scoreEl.textContent = state.score.toString();
      applyTheme();
      render();

      // Petit message d’accueil la première fois
      const welcomed = localStorage.getItem('welcomed');
      if(!welcomed){
        showToast('Bienvenue', 'Cette page est prête pour GitHub Pages.');
        localStorage.setItem('welcomed', '1');
      }
    })();
    // Gestion du formulaire de contact (simulation)

    const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    formMessage.style.display = 'block';
    formMessage.style.color = 'var(--good)';
    formMessage.textContent = 'Message envoyé (simulation). Merci !';

    form.reset();
  });
}

