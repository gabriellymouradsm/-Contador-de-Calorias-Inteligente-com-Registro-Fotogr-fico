/* Gerenciador de LocalStorage e Cálculo Metabólico para o SparkKcal */

const STORAGE_KEYS = {
  PROFILE: 'sparkkcal_profile',
  DAILY_LOGS: 'sparkkcal_daily_logs',
  WEIGHT_HISTORY: 'sparkkcal_weight_history',
  PHOTOS: 'sparkkcal_photos',
  RECENT_FOODS: 'sparkkcal_recent_foods',
  THEME: 'sparkkcal_theme'
};

const StorageManager = {
  // --- PERFIL DE USUÁRIO ---
  getProfile() {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // --- CÁLCULO DE TAXA METABÓLICA BASAL E METAS ---
  calculateMetabolicRates(profile) {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseInt(profile.age, 10);
    const gender = profile.gender;
    const activityFactor = parseFloat(profile.activityLevel);
    const goal = profile.goal;

    // Fórmula de Mifflin-St Jeor
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'masculino') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    bmr = Math.round(bmr);

    let tdee = Math.round(bmr * activityFactor);

    // Ajuste pelo objetivo
    let targetCalories = tdee;
    if (goal === 'emagrecer') {
      targetCalories = Math.round(tdee - 500); // Déficit de 500 kcal
      if (targetCalories < 1200) targetCalories = 1200; // Mínimo seguro
    } else if (goal === 'ganhar') {
      targetCalories = Math.round(tdee + 400); // Superávit de 400 kcal
    }

    // Cálculo de Macronutrientes Padrão (30% Proteína, 45% Carboidrato, 25% Gordura)
    const targetProtein = Math.round((targetCalories * 0.30) / 4);
    const targetCarbs = Math.round((targetCalories * 0.45) / 4);
    const targetFats = Math.round((targetCalories * 0.25) / 9);

    // Meta de Água (35ml por kg de peso corporal)
    const targetWater = Math.round(weight * 35);

    return {
      bmr,
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      targetWater
    };
  },

  // --- REGISTRO DIÁRIO DE ALIMENTOS E ÁGUA ---
  getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getDailyLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : {};
  },

  getTodayLog() {
    const logs = this.getDailyLogs();
    const todayKey = this.getTodayKey();
    if (!logs[todayKey]) {
      logs[todayKey] = {
        date: todayKey,
        waterMl: 0,
        meals: {
          cafe: [],
          almoco: [],
          jantar: [],
          lanches: []
        }
      };
      this.saveDailyLogs(logs);
    }
    return logs[todayKey];
  },

  saveDailyLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  },

  addMealItem(mealType, foodItem) {
    const logs = this.getDailyLogs();
    const todayKey = this.getTodayKey();
    const todayLog = this.getTodayLog();

    if (!todayLog.meals[mealType]) {
      todayLog.meals[mealType] = [];
    }

    const itemWithId = {
      ...foodItem,
      logItemId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };

    todayLog.meals[mealType].push(itemWithId);
    logs[todayKey] = todayLog;
    this.saveDailyLogs(logs);

    // Adiciona ao histórico de recentes
    this.addRecentFood(foodItem);
    return todayLog;
  },

  removeMealItem(mealType, logItemId) {
    const logs = this.getDailyLogs();
    const todayKey = this.getTodayKey();
    const todayLog = this.getTodayLog();

    if (todayLog.meals[mealType]) {
      todayLog.meals[mealType] = todayLog.meals[mealType].filter(item => item.logItemId !== logItemId);
      logs[todayKey] = todayLog;
      this.saveDailyLogs(logs);
    }
    return todayLog;
  },

  updateWater(amountMl, isIncrement = true) {
    const logs = this.getDailyLogs();
    const todayKey = this.getTodayKey();
    const todayLog = this.getTodayLog();

    if (isIncrement) {
      todayLog.waterMl = (todayLog.waterMl || 0) + amountMl;
    } else {
      todayLog.waterMl = amountMl;
    }

    if (todayLog.waterMl < 0) todayLog.waterMl = 0;

    logs[todayKey] = todayLog;
    this.saveDailyLogs(logs);
    return todayLog.waterMl;
  },

  // --- HISTÓRICO DE RECENTES ---
  getRecentFoods() {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_FOODS);
    return data ? JSON.parse(data) : [];
  },

  addRecentFood(food) {
    let recent = this.getRecentFoods();
    recent = recent.filter(item => item.nome.toLowerCase() !== food.nome.toLowerCase());
    recent.unshift(food);
    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENT_FOODS, JSON.stringify(recent));
  },

  // --- MEDIÇÕES DE PESO E MEDIDAS ---
  getWeightHistory() {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  addWeightEntry(entry) {
    const history = this.getWeightHistory();
    history.unshift({
      ...entry,
      id: 'weight_' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(history));
    return history;
  },

  // --- FOTOS ---
  getPhotos() {
    const data = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    return data ? JSON.parse(data) : [];
  },

  addPhoto(photoDataUrl, mealInfo) {
    const photos = this.getPhotos();
    photos.unshift({
      id: 'photo_' + Date.now(),
      dataUrl: photoDataUrl,
      date: new Date().toLocaleDateString('pt-BR'),
      mealInfo
    });
    // Manter no máximo 6 fotos salvas localmente para economizar quota do localStorage
    if (photos.length > 6) photos.pop();
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    return photos;
  },

  // --- TEMA ---
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // --- RESET TOTAL ---
  clearAll() {
    localStorage.clear();
  }
};
