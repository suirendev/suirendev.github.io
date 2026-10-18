(() => {
  'use strict';
  const galleries = JSON.parse(document.getElementById('work-galleries').textContent);
  const modal = document.getElementById('case-modal');
  const panel = modal.querySelector('.case-modal__panel');
  const closeButton = modal.querySelector('.case-modal__close');
  const previous = modal.querySelector('.case-modal__nav--prev');
  const next = modal.querySelector('.case-modal__nav--next');
  const media = modal.querySelector('.case-modal__media');
  const image = document.getElementById('case-modal-image');
  const dots = document.getElementById('case-modal-dots');
  const counter = document.getElementById('case-modal-counter');
  const frame = modal.querySelector('.case-modal__frame');
  const tools = document.getElementById('case-modal-tools');
  const zoomButton = document.getElementById('case-modal-zoom');
  const originalLink = document.getElementById('case-modal-original');
  let active = null;
  let position = 0;
  let trigger = null;
  let touchStart = null;
  let inertState = [];

  function setNatural(value) {
    modal.classList.toggle('is-natural',value);
    zoomButton.setAttribute('aria-pressed',String(value));
    zoomButton.textContent = value ? '横幅に合わせる' : '原寸で表示';
    frame.scrollTop = frame.scrollLeft = 0;
  }

  function renderImage() {
    const item = active.images[position];
    panel.scrollTop = 0;
    image.src = item.src;
    image.alt = item.alt;
    const native = Boolean(item.native);
    modal.classList.toggle('case-modal--native',native);
    tools.hidden = !native;
    frame.tabIndex = native ? 0 : -1;
    if (native) frame.setAttribute('aria-label','画像表示領域。原寸では上下左右にスクロールできます');
    else frame.removeAttribute('aria-label');
    setNatural(false);
    image.style.setProperty('--image-width',`${item.width || 0}px`);
    image.onload = () => {
      if (image.getAttribute('src') === item.src) image.style.setProperty('--image-width',`${image.naturalWidth}px`);
    };
    if (native) originalLink.href = item.src;
    else originalLink.removeAttribute('href');
    const multiple = active.images.length > 1;
    previous.hidden = next.hidden = dots.hidden = counter.hidden = !multiple;
    media.classList.toggle('case-modal__media--single', !multiple);
    counter.textContent = multiple ? `${position + 1} / ${active.images.length}` : '';
    if (dots.children.length !== active.images.length) {
      dots.replaceChildren();
      active.images.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button'; dot.className = 'case-modal__dot';
        dot.setAttribute('aria-label', `画像 ${index + 1} を表示`);
        dot.addEventListener('click', () => { position = index; renderImage(); });
        dots.append(dot);
      });
    }
    Array.from(dots.children).forEach((dot,index) => {
      dot.classList.toggle('is-active',position === index);
      dot.setAttribute('aria-current',String(position === index));
    });
  }
  function changeImage(direction) {
    if (!active) return;
    position = (position + direction + active.images.length) % active.images.length;
    renderImage();
  }
  function openModal(button) {
    const selected = galleries[button.dataset.gallery];
    if (!selected || !selected.images.length) return;
    active = selected; position = Math.max(0,Math.min(Number(button.dataset.index) || 0,selected.images.length-1)); trigger = button;
    modal.classList.toggle('case-modal--journal',button.dataset.gallery.startsWith('journal-'));
    document.getElementById('case-modal-label').textContent = active.label;
    document.getElementById('case-modal-title').textContent = active.title;
    document.getElementById('case-modal-description').textContent = active.description;
    renderImage();
    inertState = Array.from(document.body.children).filter(el => el !== modal && !['SCRIPT','STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
    inertState.forEach(([el]) => { el.inert = true; });
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    closeButton.focus();
  }
  function closeModal() {
    if (!active) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    inertState.forEach(([el, value]) => { el.inert = value; });
    if (trigger?.isConnected) trigger.focus();
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
    active = null; touchStart = null;
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-gallery]');
    if (!button) return;
    if (button.classList.contains('is-spoiler') && !button.classList.contains('is-revealed')) {
      button.classList.add('is-revealed');
      button.querySelector('.spoiler-cover').remove();
      button.setAttribute('aria-label', `${galleries[button.dataset.gallery].title}の画像を拡大`);
      return;
    }
    openModal(button);
  });
  closeButton.addEventListener('click', closeModal);
  zoomButton.addEventListener('click',() => setNatural(!modal.classList.contains('is-natural')));
  image.addEventListener('click',() => {
    if (active && modal.classList.contains('case-modal--native')) setNatural(!modal.classList.contains('is-natural'));
  });
  previous.addEventListener('click', () => changeImage(-1));
  next.addEventListener('click', () => changeImage(1));
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  media.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
  }, {passive:true});
  media.addEventListener('touchend', event => {
    if (!touchStart || !active || active.images.length < 2 || modal.classList.contains('is-natural')) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) changeImage(dx < 0 ? 1 : -1);
    touchStart = null;
  }, {passive:true});
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction=event.key === 'ArrowLeft' ? -1 : 1;
      if (modal.classList.contains('is-natural')) frame.scrollBy({left:direction*80});
      else changeImage(direction);
    }
    if (event.key === 'Tab') {
      const buttons = Array.from(panel.querySelectorAll('button, a[href], [tabindex="0"]')).filter(el => !el.hidden && el.offsetParent !== null);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const labelClass = ai => ({Claude:'claude',Codex:'codex','Claude Code':'claude-code'}[ai] || 'codex');
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function journalMedia(entry, key, index = 0) {
    const button = element('button', 'work-media');
    button.type = 'button'; button.dataset.gallery = key; button.dataset.index = String(index);
    button.setAttribute('aria-haspopup','dialog'); button.setAttribute('aria-controls','case-modal');
    button.setAttribute('aria-label', `${entry.title}の画像を拡大`);
    const img = element('img'); img.src = entry.images[index].thumb; img.alt = entry.images[index].alt;
    img.loading = 'lazy'; img.decoding = 'async'; button.append(img);
    button.append(element('span','work-view-tag','＋ VIEW'));
    if (entry.spoiler) {
      button.classList.add('is-spoiler');
      const cover = element('span','spoiler-cover','ネタバレ注意');
      cover.append(element('small','','クリックで表示'));
      button.append(cover);
      button.setAttribute('aria-label', `${entry.title}：ネタバレを含む画像を表示`);
    }
    galleries[key] = {title:entry.title, description:entry.note || '', label:entry.galleryLabel || (entry.ai ? `// ${entry.ai}` : '// AI JOURNEY'), images:entry.images.map(img => ({...img}))};
    return button;
  }
  let journalCards = [];
  let selectedFilter = 'all';
  function applyFilter() {
    journalCards.forEach(card => { card.hidden = selectedFilter !== 'all' && card.dataset.ai !== selectedFilter; });
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    selectedFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed',String(other === button)));
    applyFilter();
  }));
  async function loadJournal() {
    const response = await fetch('data/journal.json');
    if (!response.ok) throw new Error('Journal unavailable');
    const data = await response.json();
    const entries = document.getElementById('journal-entries');
    const art = document.getElementById('journal-art');
    data.entries.sort((a,b) => b.date.localeCompare(a.date)).forEach((entry,index) => {
      const card = element('article','journal-card'); card.dataset.ai = entry.ai;
      if (entry.images?.length) card.append(journalMedia(entry, `journal-${index}`));
      const body = element('div','journal-card-body');
      const meta = element('div','journal-meta');
      const date = element('time','',entry.date); date.dateTime = entry.date;
      meta.append(date,element('span',`ai-label ai-label--${labelClass(entry.ai)}`,entry.ai));
      body.append(meta,element('h4','',entry.title),element('p','',entry.note));
      card.append(body); entries.append(card); journalCards.push(card);
    });
    applyFilter();
    data.images.forEach((entry,index) => {
      const card = element('article','journal-card');
      card.append(journalMedia(entry, `art-${index}`));
      const body = element('div','journal-card-body');
      body.append(element('p','',entry.title),element('span',`ai-label ai-label--${labelClass(entry.ai)}`,entry.ai));
      card.append(body); art.append(card);
    });
    document.getElementById('journal-status').hidden = true;
  }
  loadJournal().catch(() => {
    document.getElementById('journal-status').textContent = '読み込めませんでした。ページを再読み込みしてください。';
  });
  async function loadJourney() {
    const response = await fetch('data/journey.json');
    if (!response.ok) throw new Error('Journey unavailable');
    const data = await response.json();
    const timeline = document.getElementById('journey-chapters');
    data.chapters.forEach((chapter,index) => {
      const row = element('li','journey-chapter');
      const article = element('article','journey-content');
      article.append(element('h4','journey-chapter-title',chapter.title));
      if (chapter.images?.length) {
        const images = element('div','journey-images');
        chapter.images.forEach((_,imageIndex) => images.append(journalMedia(chapter,`journey-${index}`,imageIndex)));
        article.append(images);
      } else row.classList.add('journey-chapter--compact');
      if (chapter.learning) {
        const learning = element('div','journey-learning');
        learning.append(element('h5','','セルたんとの対話・学び'),element('p','',chapter.learning));
        article.append(learning);
      }
      row.append(article); timeline.append(row);
    });
    data.planned.forEach(title => document.getElementById('journey-planned').append(element('li','',`『${title}』`)));
    document.getElementById('journey-status').hidden = true;
  }
  loadJourney().catch(() => {
    document.getElementById('journey-status').textContent = '読み込めませんでした。ページを再読み込みしてください。';
  });
  function momentBubble(item,text,kind) {
    const bubble=element('div',`moment-bubble moment-bubble--${kind}`);
    if (kind === 'reply') bubble.append(element('span',`ai-label ai-label--${labelClass(item.ai)}`,`${item.aiName}（${item.ai}）`));
    else bubble.append(element('span','moment-bubble-caption',kind === 'request' ? '私のお願い' : '私のひとこと'));
    bubble.append(element('p','',text));
    return bubble;
  }
  async function loadMoments() {
    const response=await fetch('data/moments.json');
    if (!response.ok) throw new Error('Moments unavailable');
    const data=await response.json();
    document.getElementById('moments-lead').textContent=data.lead;
    const list=document.getElementById('moments-items');
    data.items.forEach(item => {
      const card=element('article',`moment-card moment-card--${item.layout}`);
      card.id=`moment-${item.id}`;
      const header=element('div','moment-heading');
      header.append(element('h4','',item.title));
      if (item.ai) header.append(element('span',`ai-label ai-label--${labelClass(item.ai)}`,`${item.aiName}（${item.ai}）`));
      card.append(header);
      if (item.layout === 'chat') {
        const chat=element('div','moment-chat');
        if (item.request) chat.append(momentBubble(item,item.request,'request'));
        if (item.note) chat.append(element('p','moment-note',item.note));
        if (item.reply) chat.append(momentBubble(item,item.reply,'reply'));
        if (item.comment) chat.append(momentBubble(item,item.comment,'comment'));
        card.append(chat);
      } else if (item.body) card.append(element('p','moment-body',item.body));
      if (item.images?.length) {
        const images=element('div',`moment-images moment-images--${item.images.length === 1 ? 'single' : item.images.length === 2 ? 'two' : 'multiple'}`);
        const gallery={...item,note:item.body || item.note || '',galleryLabel:'// AI MOMENTS'};
        item.images.forEach((_,index) => images.append(journalMedia(gallery,`moment-${item.id}`,index)));
        card.append(images);
      }
      list.append(card);
    });
    document.getElementById('moments-status').hidden=true;
  }
  loadMoments().catch(() => {
    document.getElementById('moments-status').textContent='読み込めませんでした。ページを再読み込みしてください。';
  });
})();
