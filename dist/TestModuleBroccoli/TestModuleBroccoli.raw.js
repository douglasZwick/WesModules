(() => {
  // src/TestModuleBroccoli/Selector.js
  var WesData = class _WesData {
    constructor() {
      this.Active = false;
      this.CleanupFns = [];
    }
    /**
     * 
     * @param {any} maybeWes 
     * @returns {WesData}
     */
    static EnsureValid(maybeWes) {
      if (_WesData.IsValid(maybeWes))
        return maybeWes;
      return new _WesData();
    }
    /**
     * 
     * @param {any} value 
     * @returns {value is WesData}
     */
    static IsValid(value) {
      return typeof value === "object" && value != null && typeof value.Active === "boolean" && Array.isArray(value.CleanupFns);
    }
    /**
     * 
     * @param {() => void} cleanupFn 
     */
    RegisterCleanup(cleanupFn) {
      this.CleanupFns.push(cleanupFn);
    }
    ShutDown() {
      for (const cleanupFn of this.CleanupFns) {
        try {
          cleanupFn();
        } catch (e) {
          console.warn("Cleanup function failed.\nFunction:", cleanupFn, "\nError:", e);
        }
      }
      this.CleanupFns = [];
      this.Active = false;
    }
  };
  var WesDebug = class _WesDebug {
    /** @type {boolean} */
    static #UseDebug = false;
    static EnableLogging() {
      _WesDebug.#UseDebug = true;
    }
    static DisableLogging() {
      _WesDebug.#UseDebug = false;
    }
    /**
     * 
     * @returns {boolean}
     */
    static IsEnabled() {
      return _WesDebug.#UseDebug;
    }
    /**
     * 
     * @param  {...any} args 
     */
    static Log(...args) {
      if (!_WesDebug.#UseDebug) return;
      console.log(...args);
    }
  };
  var win = window;
  win.WesDebug = WesDebug;
  var processElement = () => {
  };
  var highlightBox = null;
  function GetHighlightBox() {
    if (!highlightBox)
      throw new Error("Tried to access the highlightBox before it was created");
    return highlightBox;
  }
  var currentElement = null;
  var latestMousePosition = { x: 0, y: 0 };
  var highlightBoxStyle = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: "2147483647",
    border: "1px solid rgba(255, 255, 0, 0.2)",
    backgroundColor: "rgba(255, 255, 0, 0.2)"
  };
  function StartElementSelector(callback) {
    if (win.__WES?.Active) return;
    win.__WES = WesData.EnsureValid(win.__WES);
    win.__WES.Active = true;
    win.WesDebug?.Log("WebElementSelector framework activated");
    CallbackSetup(callback);
    CreateHighlightBox();
    ConnectAllEvents();
  }
  function CallbackSetup(callback) {
    processElement = callback;
    RegisterCleanup(() => processElement = () => {
    });
  }
  function CreateHighlightBox() {
    highlightBox = document.createElement("div");
    Object.assign(highlightBox.style, highlightBoxStyle);
    document.body.appendChild(highlightBox);
    RegisterCleanup(DestroyHighlightBox);
  }
  function DestroyHighlightBox() {
    if (!highlightBox) return;
    document.body.removeChild(highlightBox);
    highlightBox = null;
  }
  function ConnectAllEvents() {
    ConnectEvent("mousemove", OnMouseMove, true);
    ConnectEvent("scroll", OnScroll, true);
    ConnectEvent("click", OnClick, true);
    ConnectEvent("mousedown", EatEvent, true);
    ConnectEvent("mouseup", EatEvent, true);
    ConnectEvent("pointerdown", EatEvent, true);
    ConnectEvent("pointerup", EatEvent, true);
    ConnectEvent("keydown", OnKeyDown, true);
  }
  function ConnectEvent(eventName, callback, options) {
    window.addEventListener(eventName, callback, options);
    RegisterCleanup(
      () => window.removeEventListener(eventName, callback, options)
    );
  }
  function RegisterCleanup(cleanupFn) {
    if (!win.__WES)
      throw new Error("Tried to register a cleanup before WES was initialized");
    win.__WES.RegisterCleanup(cleanupFn);
  }
  function OnMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    latestMousePosition.x = x;
    latestMousePosition.y = y;
    UpdateCurrentElementFromPoint(x, y);
  }
  function UpdateCurrentElementFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return;
    if (element === currentElement) return;
    if (element === highlightBox) return;
    currentElement = element;
    AdjustBoxToElement(
      GetHighlightBox(),
      currentElement,
      win.scrollX,
      win.scrollY
    );
  }
  function AdjustBoxToElement(box, element, scrollX, scrollY) {
    const rect = element.getBoundingClientRect();
    AdjustBoxToRect(box, rect, scrollX, scrollY);
  }
  function AdjustBoxToRect(box, rect, scrollX, scrollY) {
    Object.assign(
      box.style,
      {
        top: rect.top + scrollY + "px",
        left: rect.left + scrollX + "px",
        width: rect.width + "px",
        height: rect.height + "px"
      }
    );
  }
  function OnScroll(e) {
    UpdateCurrentElementFromPoint(latestMousePosition.x, latestMousePosition.y);
  }
  function OnClick(e) {
    EatEvent(e);
    UpdateCurrentElementFromPoint(e.clientX, e.clientY);
    if (currentElement != null) {
      win.WesDebug?.Log("Selected element:", currentElement);
      processElement(currentElement);
    }
    ShutDown();
  }
  function EatEvent(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
  function OnKeyDown(e) {
    if (e.key === "Escape") {
      EatEvent(e);
      win.WesDebug?.Log("Canceling element selection");
      ShutDown();
    }
  }
  function ShutDown() {
    if (!win.__WES?.Active) return;
    win.__WES.ShutDown();
    currentElement = null;
  }

  // src/TestModuleBroccoli/Module.js
  function ProcessElement(element) {
    console.log("TestModuleBroccoli engaged");
    console.log("Selected element:", element);
  }

  // src/TestModuleBroccoli/Main.js
  StartElementSelector(ProcessElement);
})();
