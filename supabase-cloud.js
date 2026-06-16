(function () {
  const SYNC_KEYS = [
    "creatorOpsCreators",
    "creatorOpsDeletedCreators",
    "creatorOpsSkus",
    "creatorOpsDeletedSkus",
    "creatorOpsSamples",
    "creatorOpsDeletedSamples",
    "creatorOpsVideos",
    "creatorOpsDeletedVideos",
    "creatorOpsLives",
    "creatorOpsDeletedLives",
    "creatorOpsMemoryOwners",
    "creatorOpsMemorySkus",
    "creatorOpsMemorySampleCosts"
  ];

  const config = window.CREATOR_OPS_SUPABASE || {};
  const configured = Boolean(
    config.SUPABASE_URL &&
    config.SUPABASE_ANON_KEY &&
    !config.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !config.SUPABASE_ANON_KEY.includes("YOUR-SUPABASE")
  );

  const state = {
    client: null,
    session: null,
    profile: null,
    ready: false,
    syncing: false,
    writeTimer: null
  };

  function role() {
    return state.profile?.role || (configured ? "readonly" : "admin");
  }

  function ownerName() {
    return state.profile?.owner_name || "";
  }

  function canWriteRecord(owner = "") {
    if (!configured) return true;
    if (role() === "admin") return true;
    if (role() === "readonly") return false;
    if (role() === "operator") return !owner || owner === ownerName();
    return false;
  }

  function assertWritable(owner = "") {
    if (canWriteRecord(owner)) return true;
    window.dispatchEvent(new CustomEvent("creator-cloud-denied"));
    return false;
  }

  function loginScreen() {
    return document.querySelector("#loginScreen");
  }

  function loginMessage() {
    return document.querySelector("#loginMessage");
  }

  function showLogin(message = "") {
    loginScreen()?.classList.add("open");
    loginScreen()?.setAttribute("aria-hidden", "false");
    if (loginMessage()) loginMessage().textContent = message;
  }

  function hideLogin() {
    loginScreen()?.classList.remove("open");
    loginScreen()?.setAttribute("aria-hidden", "true");
  }

  async function loadProfile() {
    const user = state.session?.user;
    if (!user) return null;
    const { data, error } = await state.client
      .from("creator_ops_users")
      .select("user_id,email,role,owner_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    state.profile = data || { user_id: user.id, email: user.email, role: "readonly", owner_name: "" };
    document.body.dataset.role = state.profile.role;
    document.body.dataset.owner = state.profile.owner_name || "";
    return state.profile;
  }

  async function pullCloudState() {
    state.syncing = true;
    const { data, error } = await state.client.from("creator_ops_state").select("key,value");
    if (error) throw error;
    (data || []).forEach((row) => {
      if (SYNC_KEYS.includes(row.key)) {
        localStorage.setItem(row.key, JSON.stringify(row.value ?? []));
      }
    });
    state.syncing = false;
  }

  async function pushKey(key) {
    if (!state.ready || state.syncing || !SYNC_KEYS.includes(key) || role() === "readonly") return;
    let value = [];
    try {
      value = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      value = [];
    }
    await state.client.from("creator_ops_state").upsert({
      key,
      value,
      updated_by: state.session?.user?.id || null,
      updated_at: new Date().toISOString()
    });
  }

  function schedulePush(key) {
    if (!SYNC_KEYS.includes(key)) return;
    window.clearTimeout(state.writeTimer);
    state.writeTimer = window.setTimeout(() => {
      pushKey(key).catch((error) => console.warn("Cloud sync failed", error));
    }, 350);
  }

  function patchLocalStorage() {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);
      if (!state.syncing) schedulePush(key);
    };
  }

  async function signIn(email, password) {
    const { data, error } = await state.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    state.session = data.session;
    await loadProfile();
    await pullCloudState();
    state.ready = true;
    hideLogin();
    return state.profile;
  }

  async function boot(renderApp) {
    if (!configured || !window.supabase?.createClient) {
      state.ready = true;
      document.body.dataset.role = "admin";
      renderApp();
      return;
    }

    state.client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });
    patchLocalStorage();

    const { data } = await state.client.auth.getSession();
    state.session = data.session;
    if (state.session) {
      try {
        await loadProfile();
        await pullCloudState();
        state.ready = true;
        hideLogin();
        renderApp();
      } catch (error) {
        showLogin(error.message || "登录状态异常，请重新登录");
      }
    } else {
      showLogin("请输入账号密码登录");
    }

    document.querySelector("#loginForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      try {
        if (loginMessage()) loginMessage().textContent = "登录中...";
        await signIn(formData.get("email"), formData.get("password"));
        renderApp();
      } catch (error) {
        showLogin(error.message || "登录失败");
      }
    });
  }

  window.CreatorCloud = {
    boot,
    configured,
    role,
    ownerName,
    canWriteRecord,
    assertWritable,
    pushKey
  };
})();
