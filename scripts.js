const windowZIndexBase = 10;
let windowZIndexCounter = 10;

function isCompactMode() {
  return window.matchMedia('(max-width: 900px)').matches;
}

function getClientPosition(event) {
  if (event.touches && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

function ToggleStartMenu(event) {
  if (event) event.stopPropagation();

  const menu = document.getElementById('start-menu');
  const button = document.getElementById('start');
  const willOpen = menu.classList.contains('hide');

  menu.classList.toggle('hide');
  button.setAttribute('aria-expanded', String(willOpen));
}

function CloseStartMenu() {
  document.getElementById('start-menu').classList.add('hide');
  document.getElementById('start').setAttribute('aria-expanded', 'false');
}

function LaunchFromStart(id) {
  OpenTab(id);
  CloseStartMenu();
}

document.addEventListener('click', function(event) {
  const menu = document.getElementById('start-menu');
  if (!menu.contains(event.target) && event.target.id !== 'start') {
    CloseStartMenu();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') CloseStartMenu();
});

function updateDateTime() {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.querySelector('#time').textContent = now;
}

updateDateTime();
setInterval(updateDateTime, 1000);

function initializeWindowZIndex(windowElement) {
  if (!windowElement.style.zIndex || windowElement.style.zIndex === '') {
    windowElement.style.zIndex = windowZIndexCounter;
    windowZIndexCounter++;
  }
}

function getVisibleWindowsSorted() {
  const allWindows = Array.from(document.getElementsByClassName('window'));
  const visibleWindows = allWindows.filter(function(win) {
    return !win.classList.contains('hide');
  });
  
  visibleWindows.sort(function(a, b) {
    const zIndexA = parseInt(a.style.zIndex) || windowZIndexBase;
    const zIndexB = parseInt(b.style.zIndex) || windowZIndexBase;
    return zIndexA - zIndexB;
  });
  
  return visibleWindows;
}

function bringWindowToFront(windowElement) {
  initializeWindowZIndex(windowElement);
  const visibleWindows = getVisibleWindowsSorted();

  const index = visibleWindows.indexOf(windowElement);
  if (index !== -1) {
    visibleWindows.splice(index, 1);
  }
  
  visibleWindows.forEach(function(win, i) {
    win.style.zIndex = windowZIndexBase + i;
  });
  
  const topZIndex = windowZIndexBase + visibleWindows.length;
  windowElement.style.zIndex = topZIndex;
  
  if (topZIndex >= windowZIndexCounter) {
    windowZIndexCounter = topZIndex + 1;
  }
}

function initializeAllWindows() {
  const allWindows = document.getElementsByClassName('window');
  let visibleCount = 0;
  
  for (let i = 0; i < allWindows.length; i++) {
    const win = allWindows[i];
    if (!win.classList.contains('hide')) {
      win.style.zIndex = windowZIndexBase + visibleCount;
      visibleCount++;
    }
  }
  
  windowZIndexCounter = windowZIndexBase + visibleCount;
  
  const welcomeWindow = document.getElementById("welcome");
  if (welcomeWindow && !welcomeWindow.classList.contains('hide')) {
    bringWindowToFront(welcomeWindow);
  }
}

initializeAllWindows();

const windows = Array.from(document.getElementsByClassName('window'));
windows.forEach(function(windowElement) {
  dragElement(windowElement);
  resizeElement(windowElement);
});

function dragElement(tab) {
  let pos3 = 0;
  let pos4 = 0;
  const header = document.getElementById(tab.id + "header");

  if (header) {
    header.onmousedown = dragMouseDown;
    header.ontouchstart = dragTouchStart;
  } else {
    tab.onmousedown = dragMouseDown;
    tab.ontouchstart = dragTouchStart;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    
    if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('.title-bar-controls'))) {
      return;
    }
    
    e.preventDefault();
    const pos = getClientPosition(e);
    pos3 = pos.x;
    pos4 = pos.y;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    
    bringWindowToFront(tab);
  }

  function dragTouchStart(e) {
    if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('.title-bar-controls'))) {
      return;
    }

    e.preventDefault();
    const pos = getClientPosition(e);
    pos3 = pos.x;
    pos4 = pos.y;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementDragTouch;
    
    bringWindowToFront(tab);
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    updatePosition(e);
  }

  function elementDragTouch(e) {
    e.preventDefault();
    updatePosition(e);
  }

  function updatePosition(e) {
    const pos = getClientPosition(e);

    const deltaX = pos3 - pos.x;
    const deltaY = pos4 - pos.y;
    pos3 = pos.x;
    pos4 = pos.y;

    const newTop = tab.offsetTop - deltaY;
    const newLeft = tab.offsetLeft - deltaX;
    const menuHeight = 50;
    
    if (newTop < 0) {
      tab.style.top = 0 + "px";
    }
    else if (newTop > (window.innerHeight - menuHeight - tab.offsetHeight)) {
      tab.style.top = (window.innerHeight - menuHeight - tab.offsetHeight) + "px";
    }
    else {
      tab.style.top = newTop + "px";
    }
    
    if (newLeft < 10) {
      tab.style.left = 0 + "px";
    } else if (newLeft > window.innerWidth - tab.offsetWidth - 10) {
      tab.style.left = (window.innerWidth - tab.offsetWidth) + "px";
    } else {
      tab.style.left = newLeft + "px";
    }

    bringWindowToFront(tab);
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}


function ShowTab(id) {
  const element = document.getElementById(id);
  if (element.classList.contains('hide')) {
    element.classList.remove('hide');
    initializeWindowZIndex(element);
    bringWindowToFront(element);
    const existingHandle = element.querySelector('.window-resize-handle');
    if (!existingHandle) {
      resizeElement(element);
    }
  } else {
    element.classList.add('hide');
  }
}

function CloseTab(id) {
  const windowElement = document.getElementById(id);

  if (windowElement.classList.contains('max')) {
    restoreWindow(windowElement);
  }

  windowElement.classList.add('hide');
  document.getElementById(id + "tab").classList.add('hide');
}

function OpenTab(id) {
  const element = document.getElementById(id + "tab");
  const windowElement = document.getElementById(id);

  element.classList.remove('hide');

  if (windowElement.classList.contains('hide')) {
    windowElement.classList.remove('hide');
    initializeWindowZIndex(windowElement);
  }

  bringWindowToFront(windowElement);

  const existingHandle = windowElement.querySelector('.window-resize-handle');
  if (!existingHandle) {
    resizeElement(windowElement);
  }

  if (isCompactMode()) {
    const body = windowElement.querySelector('.window-body');
    if (body) {
      body.scrollTop = 0;
    }
  }
}


function resizeElement(windowElement) {
  if (!windowElement) return;
  
  const existingHandle = windowElement.querySelector('.window-resize-handle');
  if (existingHandle) {
    return;
  }
  
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'window-resize-handle';
  windowElement.appendChild(resizeHandle);
  
  let pos3 = 0, pos4 = 0;
  let startWidth = 0, startHeight = 0;

  function resizeMouseDown(e) {
    e = e || window.event;

    if (isCompactMode()) return;

    e.preventDefault();
    e.stopPropagation();
    
    if (windowElement.classList.contains('max')) {
      return;
    }
    
    const pos = getClientPosition(e);
    pos3 = pos.x;
    pos4 = pos.y;
    
    startWidth = windowElement.offsetWidth;
    startHeight = windowElement.offsetHeight;
    document.onmouseup = closeResizeElement;
    document.onmousemove = elementResize;
    
    bringWindowToFront(windowElement);
  }

  function resizeTouchStart(e) {
    if (isCompactMode()) return;

    e.preventDefault();
    e.stopPropagation();
    
    if (windowElement.classList.contains('max')) {
      return;
    }
    
    const pos = getClientPosition(e);
    pos3 = pos.x;
    pos4 = pos.y;
    
    startWidth = windowElement.offsetWidth;
    startHeight = windowElement.offsetHeight;
    document.ontouchend = closeResizeElement;
    document.ontouchmove = elementResizeTouch;
    
    bringWindowToFront(windowElement);
  }

  function elementResize(e) {
    e = e || window.event;
    e.preventDefault();
    updateResizePosition(e);
  }

  function elementResizeTouch(e) {
    e.preventDefault();
    updateResizePosition(e);
  }

  function updateResizePosition(e) {
    const pos = getClientPosition(e);
    const deltaX = pos.x - pos3;
    const deltaY = pos.y - pos4;
    
    let newWidth = startWidth + deltaX;
    let newHeight = startHeight + deltaY;
    
    const menuHeight = 50;
    const minWidth = 300;
    const minHeight = 200;
    const maxWidth = window.innerWidth - windowElement.offsetLeft - 10;
    const maxHeight = window.innerHeight - windowElement.offsetTop - menuHeight - 10;
    
    newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
    
    windowElement.style.width = newWidth + "px";
    windowElement.style.height = newHeight + "px";
    
    bringWindowToFront(windowElement);
  }

  function closeResizeElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }

  resizeHandle.onmousedown = resizeMouseDown;
  resizeHandle.ontouchstart = resizeTouchStart;
}

function restoreWindow(element) {
  element.classList.remove('max');

  const maximizeButton = element.querySelector('[aria-label="Maximize"], [aria-label="Restore"]');
  if (maximizeButton) {
    maximizeButton.setAttribute('aria-label', 'Maximize');
  }

  dragElement(element);

  if (!element.querySelector('.window-resize-handle')) {
    resizeElement(element);
  }
}

function Maximize(id) {
  const element = document.getElementById(id);
  const maximizeButton = element.querySelector('[aria-label="Maximize"], [aria-label="Restore"]');

  if (element.classList.contains('max')) {
    restoreWindow(element);
  } else {
    const header = document.getElementById(id + "header");
    element.classList.add('max');
    maximizeButton.setAttribute('aria-label', 'Restore');

    header.onmousedown = null;
    header.ontouchstart = null;

    bringWindowToFront(element);
  }
}

function SwitchContentProj(s, e) {
  const start = document.getElementById("projects-" + s);
  const end = document.getElementById("projects-" + e);

  start.classList.add("hide");
  end.classList.remove("hide");
}

function SwitchContentGallery(s) {
  const allImages = document.querySelectorAll('#gallery .gal-image');
  const allButtons = document.querySelectorAll('#gallery .gal-button');

  allImages.forEach((image) => image.classList.add('hide'));
  allButtons.forEach((button) => {
    const isSelected = button.dataset.galleryItem === s;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });

  const selectedImage = document.getElementById("gal-" + s);
  if (selectedImage) {
    selectedImage.classList.remove('hide');
  }
}
