/* Lógica Principal da Aplicação SparkKcal SPA */

document.addEventListener('DOMContentLoaded', () => {
  // --- INICIALIZAÇÃO E NAVEGAÇÃO SPA ---
  const views = {
    welcome: document.getElementById('view-welcome'),
    dashboard: document.getElementById('view-dashboard'),
    diario: document.getElementById('view-diario'),
    fotos: document.getElementById('view-fotos'),
    agua: document.getElementById('view-agua'),
    graficos: document.getElementById('view-graficos'),
    medidas: document.getElementById('view-medidas'),
    perfil: document.getElementById('view-perfil')
  };

  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  const topHeader = document.getElementById('top-header');
  const bottomNav = document.querySelector('.bottom-nav');

  let caloriasChartInstance = null;
  let macrosChartInstance = null;

  // --- GERENCIAMENTO DE TEMA (LIGHT/DARK) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }

  // Carregar Tema Salvo
  const currentTheme = StorageManager.getTheme();
  applyTheme(currentTheme);

  // Verificar se o usuário já possui perfil configurado
  const userProfile = StorageManager.getProfile();
  if (!userProfile) {
    showView('welcome');
    topHeader.style.display = 'none';
    bottomNav.style.display = 'none';
  } else {
    showView('dashboard');
    updateAllViews();
  }

  // --- NAVEGAÇÃO DA BARRA INFERIOR ---
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      showView(target);
    });
  });

  function showView(viewKey) {
    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.remove('active');
      }
    });

    if (views[viewKey]) {
      views[viewKey].classList.add('active');
    }

    // Atualiza estado dos botões da bottom nav
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === viewKey) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Se o perfil existir, certifique-se de que header e nav estejam visíveis
    if (StorageManager.getProfile()) {
      topHeader.style.display = 'flex';
      bottomNav.style.display = 'flex';
    }

    // Renderizar gráficos se a aba selecionada for gráficos
    if (viewKey === 'graficos') {
      renderCharts();
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      StorageManager.saveTheme(newTheme);
    });
  }

  // --- FORMULÁRIO DE ONBOARDING / CONFIGURAÇÃO ---
  const onboardingForm = document.getElementById('onboarding-form');
  onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const profileData = {
      name: document.getElementById('user-name').value.trim(),
      age: document.getElementById('user-age').value,
      gender: document.getElementById('user-gender').value,
      weight: document.getElementById('user-weight').value,
      height: document.getElementById('user-height').value,
      activityLevel: document.getElementById('user-activity').value,
      goal: document.getElementById('user-goal').value
    };

    StorageManager.saveProfile(profileData);

    // Salvar primeira entrada no histórico de peso
    StorageManager.addWeightEntry({
      peso: profileData.weight,
      gordura: '',
      cintura: '',
      quadril: '',
      braco: ''
    });

    topHeader.style.display = 'flex';
    bottomNav.style.display = 'flex';
    showView('dashboard');
    updateAllViews();
  });

  // --- ATUALIZAÇÃO GERAL DE INTERFACE ---
  function updateAllViews() {
    const profile = StorageManager.getProfile();
    if (!profile) return;

    const rates = StorageManager.calculateMetabolicRates(profile);
    const todayLog = StorageManager.getTodayLog();

    // Calcular totais de calorias e macros consumidos hoje
    let totalCal = 0;
    let totalProt = 0;
    let totalCarb = 0;
    let totalFat = 0;

    Object.keys(todayLog.meals).forEach(mealType => {
      todayLog.meals[mealType].forEach(item => {
        totalCal += parseFloat(item.kcal || 0);
        totalProt += parseFloat(item.proteina || 0);
        totalCarb += parseFloat(item.carboidrato || 0);
        totalFat += parseFloat(item.gordura || 0);
      });
    });

    totalCal = Math.round(totalCal);
    totalProt = Math.round(totalProt);
    totalCarb = Math.round(totalCarb);
    totalFat = Math.round(totalFat);

    // --- DASHBOARD UPDATE ---
    document.getElementById('dash-cal-consumed').textContent = totalCal;
    document.getElementById('dash-cal-target').textContent = rates.targetCalories;
    const remainingCal = rates.targetCalories - totalCal;
    document.getElementById('dash-cal-remaining').textContent = remainingCal;

    const calPercent = Math.min(Math.round((totalCal / rates.targetCalories) * 100), 100);
    document.getElementById('dash-cal-progress').style.width = `${calPercent}%`;

    // Macros Dashboard
    document.getElementById('dash-prot-val').textContent = totalProt;
    document.getElementById('dash-prot-target').textContent = rates.targetProtein;
    document.getElementById('dash-prot-progress').style.width = `${Math.min((totalProt / rates.targetProtein) * 100, 100)}%`;

    document.getElementById('dash-carb-val').textContent = totalCarb;
    document.getElementById('dash-carb-target').textContent = rates.targetCarbs;
    document.getElementById('dash-carb-progress').style.width = `${Math.min((totalCarb / rates.targetCarbs) * 100, 100)}%`;

    document.getElementById('dash-fat-val').textContent = totalFat;
    document.getElementById('dash-fat-target').textContent = rates.targetFats;
    document.getElementById('dash-fat-progress').style.width = `${Math.min((totalFat / rates.targetFats) * 100, 100)}%`;

    // Água Dashboard
    const waterConsumed = todayLog.waterMl || 0;
    document.getElementById('dash-water-val').textContent = waterConsumed;
    document.getElementById('dash-water-target').textContent = rates.targetWater;
    const waterPercent = Math.min(Math.round((waterConsumed / rates.targetWater) * 100), 100);
    document.getElementById('dash-water-progress').style.width = `${waterPercent}%`;

    // --- REAÇÕES E ESTADOS DO MASCOTE SPARK ---
    updateSparkState(calPercent, waterPercent, remainingCal);

    // --- DIÁRIO ALIMENTAR UPDATE ---
    renderDiarioMeals(todayLog.meals);

    // --- RASTREADOR DE ÁGUA UPDATE ---
    document.getElementById('agua-consumed-val').textContent = waterConsumed;
    document.getElementById('agua-target-val').textContent = rates.targetWater;
    document.getElementById('agua-progress-bar').style.width = `${waterPercent}%`;

    // --- PERFIL UPDATE ---
    document.getElementById('profile-display-name').textContent = profile.name;
    document.getElementById('user-avatar-letter').textContent = profile.name.charAt(0).toUpperCase();
    const goalTextMap = {
      emagrecer: 'Objetivo: Emagrecer',
      manter: 'Objetivo: Manter Peso',
      ganhar: 'Objetivo: Ganhar Massa'
    };
    document.getElementById('profile-display-goal').textContent = goalTextMap[profile.goal] || 'Manter Peso';
    document.getElementById('profile-display-bmr').textContent = rates.bmr;
    document.getElementById('profile-display-target').textContent = rates.targetCalories;
    document.getElementById('profile-display-water').textContent = rates.targetWater;

    // --- HISTÓRICO DE MEDIDAS UPDATE ---
    renderMedidasTable();

    // --- GALERIA DE FOTOS UPDATE ---
    renderRecentPhotos();
  }

  // --- LÓGICA DO MASCOTE SPARK ---
  function updateSparkState(calPercent, waterPercent, remainingCal) {
    const dashSpark = document.getElementById('dashboard-spark');
    const sparkMessage = document.getElementById('spark-message');
    const mouthPath = document.getElementById('spark-mouth-path');

    if (!dashSpark || !sparkMessage) return;

    dashSpark.classList.remove('neutral', 'focused', 'happy');

    if (calPercent >= 90 && calPercent <= 110) {
      // Bateu a meta calórica
      dashSpark.classList.add('happy');
      sparkMessage.textContent = 'Incrível! Você atingiu sua meta diária de calorias com perfeição! 🔥🎉';
      if (mouthPath) mouthPath.setAttribute('d', 'M40,78 Q50,90 60,78'); // Sorriso aberto
    } else if (waterPercent >= 100) {
      // Meta de água batida
      dashSpark.classList.add('happy');
      sparkMessage.textContent = 'Meta de hidratação atingida! Seu corpo agradece! 💧✨';
      if (mouthPath) mouthPath.setAttribute('d', 'M40,78 Q50,90 60,78');
    } else if (calPercent > 110) {
      // Ultrapassou a meta
      dashSpark.classList.add('focused');
      sparkMessage.textContent = 'Atenção: você ultrapassou a meta diária. Sem problemas, o equilíbrio vem no próximo dia!';
      if (mouthPath) mouthPath.setAttribute('d', 'M45,82 Q50,78 55,82'); // Expressão de atenção
    } else if (calPercent > 50) {
      // Em andamento focado
      dashSpark.classList.add('focused');
      sparkMessage.textContent = `Ótimo progresso! Você já consumiu ${calPercent}% das suas calorias do dia.`;
      if (mouthPath) mouthPath.setAttribute('d', 'M45,80 Q50,85 55,80');
    } else {
      // Estado Neutro / Início do dia
      dashSpark.classList.add('neutral');
      sparkMessage.textContent = 'Olá! Vamos manter o foco e registrar nossas refeições de hoje!';
      if (mouthPath) mouthPath.setAttribute('d', 'M45,80 Q50,85 55,80');
    }
  }

  // --- RENDERIZAÇÃO DO DIÁRIO ALIMENTAR ---
  function renderDiarioMeals(meals) {
    const mealTypes = ['cafe', 'almoco', 'jantar', 'lanches'];

    mealTypes.forEach(type => {
      const listEl = document.getElementById(`${type}-items-list`);
      const totalCalEl = document.getElementById(`${type}-total-cal`);

      if (!listEl || !totalCalEl) return;

      listEl.innerHTML = '';
      const items = meals[type] || [];

      let mealCalTotal = 0;

      if (items.length === 0) {
        listEl.innerHTML = '<li class="empty-meal-msg">Nenhum alimento registrado.</li>';
      } else {
        items.forEach(item => {
          mealCalTotal += parseFloat(item.kcal || 0);

          const li = document.createElement('li');
          li.className = 'meal-item';
          li.innerHTML = `
            <div class="meal-item-info">
              <span class="meal-item-name">${item.nome}</span>
              <span class="meal-item-sub">${item.porcaoGrams}g/ml • P: ${item.proteina}g C: ${item.carboidrato}g G: ${item.gordura}g</span>
            </div>
            <div class="meal-item-actions">
              <span class="meal-item-cal">${item.kcal} kcal</span>
              <button class="btn-delete-item" data-meal="${type}" data-id="${item.logItemId}" title="Excluir item">&times;</button>
            </div>
          `;
          listEl.appendChild(li);
        });
      }

      totalCalEl.textContent = Math.round(mealCalTotal);
    });

    // Event listeners para excluir itens do diário
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mealType = e.target.getAttribute('data-meal');
        const id = e.target.getAttribute('data-id');
        StorageManager.removeMealItem(mealType, id);
        updateAllViews();
      });
    });
  }

  // --- MODAL DE ADICIONAR ALIMENTO & BUSCA INTELIGENTE ---
  const foodModalBackdrop = document.getElementById('food-modal-backdrop');
  const btnCloseFoodModal = document.getElementById('btn-close-food-modal');
  const btnOpenAddFood = document.getElementById('btn-open-add-food-modal');
  const btnQuickAddMeal = document.getElementById('btn-quick-add-meal');
  const foodMealTarget = document.getElementById('food-meal-target');

  const tabBtnSearch = document.getElementById('tab-btn-search');
  const tabBtnCustom = document.getElementById('tab-btn-custom');
  const tabContentSearch = document.getElementById('tab-content-search');
  const tabContentCustom = document.getElementById('tab-content-custom');

  const foodSearchInput = document.getElementById('food-search-input');
  const searchResultsList = document.getElementById('search-results-list');
  const customFoodForm = document.getElementById('custom-food-form');

  if (btnOpenAddFood) {
    btnOpenAddFood.addEventListener('click', () => openFoodModal('cafe'));
  }
  if (btnQuickAddMeal) {
    btnQuickAddMeal.addEventListener('click', () => openFoodModal('almoco'));
  }

  document.querySelectorAll('.btn-add-meal-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const meal = e.target.getAttribute('data-meal');
      openFoodModal(meal);
    });
  });

  if (btnCloseFoodModal) {
    btnCloseFoodModal.addEventListener('click', closeFoodModal);
  }

  function openFoodModal(targetMeal = 'cafe') {
    foodMealTarget.value = targetMeal;
    foodModalBackdrop.style.display = 'flex';
    foodSearchInput.value = '';
    renderSearchResults('');
  }

  function closeFoodModal() {
    foodModalBackdrop.style.display = 'none';
  }

  // Troca de Abas no Modal
  tabBtnSearch.addEventListener('click', () => {
    tabBtnSearch.classList.add('active');
    tabBtnCustom.classList.remove('active');
    tabContentSearch.style.display = 'block';
    tabContentCustom.style.display = 'none';
  });

  tabBtnCustom.addEventListener('click', () => {
    tabBtnCustom.classList.add('active');
    tabBtnSearch.classList.remove('active');
    tabContentCustom.style.display = 'block';
    tabContentSearch.style.display = 'none';
  });

  // Busca Inteligente de Alimentos
  foodSearchInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });

  function renderSearchResults(query) {
    searchResultsList.innerHTML = '';
    const cleanQuery = query.toLowerCase().trim();

    // Combinar lista padrão com recentes
    const recentFoods = StorageManager.getRecentFoods();
    let results = [];

    if (!cleanQuery) {
      results = [...recentFoods, ...alimentosComuns];
      // Remover duplicatas por nome
      const seen = new Set();
      results = results.filter(item => {
        const k = item.nome.toLowerCase();
        return seen.has(k) ? false : seen.add(k);
      });
    } else {
      results = alimentosComuns.filter(item => item.nome.toLowerCase().includes(cleanQuery));
    }

    if (results.length === 0) {
      searchResultsList.innerHTML = '<p class="empty-meal-msg" style="text-align:center;">Nenhum alimento encontrado. Crie um item personalizado na aba ao lado!</p>';
      return;
    }

    results.forEach(food => {
      const div = document.createElement('div');
      div.className = 'search-food-item';
      div.innerHTML = `
        <div>
          <strong style="font-size:0.9rem;">${food.nome}</strong>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${food.porcaoGrams}g • P: ${food.proteina}g | C: ${food.carboidrato}g | G: ${food.gordura}g</div>
        </div>
        <button class="btn btn-primary btn-sm">+ ${food.kcal} kcal</button>
      `;

      div.addEventListener('click', () => {
        const selectedMeal = foodMealTarget.value;
        StorageManager.addMealItem(selectedMeal, food);
        closeFoodModal();
        updateAllViews();
      });

      searchResultsList.appendChild(div);
    });
  }

  // Cadastro de Alimento Personalizado
  customFoodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const customItem = {
      nome: document.getElementById('custom-name').value.trim(),
      kcal: parseFloat(document.getElementById('custom-cal').value),
      porcaoGrams: parseFloat(document.getElementById('custom-portion').value),
      proteina: parseFloat(document.getElementById('custom-prot').value) || 0,
      carboidrato: parseFloat(document.getElementById('custom-carb').value) || 0,
      gordura: parseFloat(document.getElementById('custom-fat').value) || 0
    };

    const selectedMeal = foodMealTarget.value;
    StorageManager.addMealItem(selectedMeal, customItem);
    closeFoodModal();
    updateAllViews();
    customFoodForm.reset();
  });

  // --- RASTREADOR DE ÁGUA ---
  const quickAddWaterBtn = document.getElementById('quick-add-water');
  if (quickAddWaterBtn) {
    quickAddWaterBtn.addEventListener('click', () => {
      StorageManager.updateWater(250, true);
      updateAllViews();
    });
  }

  document.querySelectorAll('.btn-water-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.getAttribute('data-amount'), 10);
      StorageManager.updateWater(amount, true);
      updateAllViews();
    });
  });

  const btnRemoveWater = document.getElementById('btn-remove-water');
  if (btnRemoveWater) {
    btnRemoveWater.addEventListener('click', () => {
      StorageManager.updateWater(-200, true);
      updateAllViews();
    });
  }

  const btnResetWater = document.getElementById('btn-reset-water');
  if (btnResetWater) {
    btnResetWater.addEventListener('click', () => {
      StorageManager.updateWater(0, false);
      updateAllViews();
    });
  }

  // --- UPLOAD DE FOTOS E IA SIMULADA ---
  const btnQuickPhoto = document.getElementById('btn-quick-photo');
  const photoDropZone = document.getElementById('photo-drop-zone');
  const cameraInput = document.getElementById('camera-input');
  const galleryInput = document.getElementById('gallery-input');
  const btnTriggerCamera = document.getElementById('btn-trigger-camera');
  const btnTriggerGallery = document.getElementById('btn-trigger-gallery');

  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const dishPreviewImg = document.getElementById('dish-preview-img');
  const scanningOverlay = document.getElementById('scanning-overlay');
  const aiResultsCard = document.getElementById('ai-results-card');
  const btnAddAiMeal = document.getElementById('btn-add-ai-meal');

  let currentPhotoDataUrl = null;
  let currentAiEstimate = null;

  if (btnQuickPhoto) {
    btnQuickPhoto.addEventListener('click', () => {
      showView('fotos');
    });
  }

  if (btnTriggerCamera) {
    btnTriggerCamera.addEventListener('click', () => cameraInput.click());
  }

  if (btnTriggerGallery) {
    btnTriggerGallery.addEventListener('click', () => galleryInput.click());
  }

  if (photoDropZone) {
    photoDropZone.addEventListener('click', (e) => {
      if (e.target.id !== 'dish-preview-img') {
        galleryInput.click();
      }
    });
  }

  [cameraInput, galleryInput].forEach(input => {
    if (input) {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          processImageFile(file);
        }
      });
    }
  });

  function processImageFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para evitar estouro de limite no localStorage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        currentPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // Exibir Preview e Animação de IA
        uploadPlaceholder.style.display = 'none';
        imagePreviewContainer.style.display = 'block';
        dishPreviewImg.src = currentPhotoDataUrl;
        scanningOverlay.style.display = 'flex';
        aiResultsCard.style.display = 'none';

        // Simular varredura de IA
        setTimeout(() => {
          scanningOverlay.style.display = 'none';
          simulateAiDetection();
        }, 1500);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function simulateAiDetection() {
    // Estimativas simuladas plausíveis de pratos da culinária brasileira
    const sampleDishes = [
      { name: 'Prato Feito (Arroz, Feijão, Frango e Salada)', kcal: 520, proteina: 38, carboidrato: 60, gordura: 12 },
      { name: 'Omelete de Queijo e Salada Verde', kcal: 340, proteina: 22, carboidrato: 5, gordura: 25 },
      { name: 'Tapioca com Peito de Peru e Queijo', kcal: 290, proteina: 18, carboidrato: 32, gordura: 9 },
      { name: 'Bife Acebolado com Batata Doce', kcal: 480, proteina: 35, carboidrato: 45, gordura: 14 }
    ];

    const randomDish = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    currentAiEstimate = randomDish;

    document.getElementById('ai-detected-name').textContent = randomDish.name;
    document.getElementById('ai-est-cal').textContent = randomDish.kcal;
    document.getElementById('ai-est-prot').textContent = `${randomDish.proteina}g`;
    document.getElementById('ai-est-carb').textContent = `${randomDish.carboidrato}g`;
    document.getElementById('ai-est-fat').textContent = `${randomDish.gordura}g`;

    aiResultsCard.style.display = 'block';
  }

  if (btnAddAiMeal) {
    btnAddAiMeal.addEventListener('click', () => {
      if (!currentAiEstimate || !currentPhotoDataUrl) return;

      const selectedMeal = document.getElementById('ai-meal-select').value;
      const mealItem = {
        nome: currentAiEstimate.name,
        kcal: currentAiEstimate.kcal,
        porcaoGrams: 350,
        proteina: currentAiEstimate.proteina,
        carboidrato: currentAiEstimate.carboidrato,
        gordura: currentAiEstimate.gordura
      };

      StorageManager.addMealItem(selectedMeal, mealItem);
      StorageManager.addPhoto(currentPhotoDataUrl, currentAiEstimate.name);

      alert('Prato adicionado com sucesso ao seu diário!');
      aiResultsCard.style.display = 'none';
      uploadPlaceholder.style.display = 'flex';
      imagePreviewContainer.style.display = 'none';
      updateAllViews();
    });
  }

  function renderRecentPhotos() {
    const photosGrid = document.getElementById('recent-photos-grid');
    if (!photosGrid) return;

    const photos = StorageManager.getPhotos();
    photosGrid.innerHTML = '';

    if (photos.length === 0) {
      photosGrid.innerHTML = '<p class="empty-photos-msg">Nenhuma foto salva ainda.</p>';
      return;
    }

    photos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'recent-photo-item';
      item.innerHTML = `<img src="${photo.dataUrl}" alt="${photo.mealInfo}">`;
      photosGrid.appendChild(item);
    });
  }

  // --- MEDIÇÕES E EVOLUÇÃO CORPORAL ---
  const medidasForm = document.getElementById('medidas-form');
  if (medidasForm) {
    medidasForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newEntry = {
        peso: document.getElementById('medida-peso').value,
        gordura: document.getElementById('medida-gordura').value,
        cintura: document.getElementById('medida-cintura').value,
        quadril: document.getElementById('medida-quadril').value,
        braco: document.getElementById('medida-braco').value
      };

      StorageManager.addWeightEntry(newEntry);

      // Atualiza também o peso do perfil principal se inserido
      const profile = StorageManager.getProfile();
      if (profile) {
        profile.weight = newEntry.peso;
        StorageManager.saveProfile(profile);
      }

      medidasForm.reset();
      updateAllViews();
    });
  }

  function renderMedidasTable() {
    const tableBody = document.getElementById('medidas-table-body');
    if (!tableBody) return;

    const history = StorageManager.getWeightHistory();
    tableBody.innerHTML = '';

    if (history.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" class="empty-table-msg">Nenhuma medição registrada.</td></tr>';
      return;
    }

    history.forEach(entry => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${entry.date}</td>
        <td><strong>${entry.peso} kg</strong></td>
        <td>${entry.cintura ? entry.cintura + ' cm' : '-'}</td>
        <td>${entry.gordura ? entry.gordura + '%' : '-'}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // --- RENDERIZAÇÃO DE GRÁFICOS (CHART.JS) ---
  function renderCharts() {
    const offlineWarning = document.getElementById('offline-chart-warning');

    if (window.chartJsFailed || typeof Chart === 'undefined') {
      if (offlineWarning) offlineWarning.style.display = 'block';
      return;
    } else {
      if (offlineWarning) offlineWarning.style.display = 'none';
    }

    const calCtx = document.getElementById('calorias-chart');
    const macroCtx = document.getElementById('macros-chart');
    if (!calCtx || !macroCtx) return;

    const dailyLogs = StorageManager.getDailyLogs();
    const profile = StorageManager.getProfile();
    const targetCal = profile ? StorageManager.calculateMetabolicRates(profile).targetCalories : 2000;

    // Gerar rótulos dos últimos 7 dias
    const labels = [];
    const calData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      labels.push(`${day}/${month}`);

      if (dailyLogs[key] && dailyLogs[key].meals) {
        let total = 0;
        Object.keys(dailyLogs[key].meals).forEach(m => {
          dailyLogs[key].meals[m].forEach(item => total += (item.kcal || 0));
        });
        calData.push(Math.round(total));
      } else {
        calData.push(0);
      }
    }

    // Gráfico de Linha de Calorias
    if (caloriasChartInstance) caloriasChartInstance.destroy();
    caloriasChartInstance = new Chart(calCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Calorias Consumidas',
            data: calData,
            borderColor: '#ff6b00',
            backgroundColor: 'rgba(255, 107, 0, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Meta Diária',
            data: Array(7).fill(targetCal),
            borderColor: '#2e7d32',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Gráfico de Rosca de Macronutrientes (Dia Atual)
    const todayLog = StorageManager.getTodayLog();
    let prot = 0, carb = 0, fat = 0;
    Object.keys(todayLog.meals).forEach(m => {
      todayLog.meals[m].forEach(item => {
        prot += (item.proteina || 0);
        carb += (item.carboidrato || 0);
        fat += (item.gordura || 0);
      });
    });

    if (macrosChartInstance) macrosChartInstance.destroy();
    macrosChartInstance = new Chart(macroCtx, {
      type: 'doughnut',
      data: {
        labels: ['Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)'],
        datasets: [{
          data: [Math.round(prot), Math.round(carb), Math.round(fat)],
          backgroundColor: ['#7b1fa2', '#ffca28', '#2e7d32']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // --- BOTÕES DO PERFIL ---
  const btnEditProfile = document.getElementById('btn-edit-profile');
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', () => {
      const profile = StorageManager.getProfile();
      if (profile) {
        document.getElementById('user-name').value = profile.name;
        document.getElementById('user-age').value = profile.age;
        document.getElementById('user-gender').value = profile.gender;
        document.getElementById('user-weight').value = profile.weight;
        document.getElementById('user-height').value = profile.height;
        document.getElementById('user-activity').value = profile.activityLevel;
        document.getElementById('user-goal').value = profile.goal;
      }
      showView('welcome');
      topHeader.style.display = 'none';
      bottomNav.style.display = 'none';
    });
  }

  const btnClearAllData = document.getElementById('btn-clear-all-data');
  if (btnClearAllData) {
    btnClearAllData.addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja apagar todos os seus dados e redefinir o app?')) {
        StorageManager.clearAll();
        location.reload();
      }
    });
  }
});
