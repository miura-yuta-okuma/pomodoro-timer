const { app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');

let win = null;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 600,
    minWidth: 360,
    minHeight: 520,
    title: 'ポモドーロタイマー',
    icon: path.join(__dirname, '..', 'icon-192.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0f0f14',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  win.once('ready-to-show', () => win.show());

  // ウィンドウを閉じてもトレイに常駐
  win.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'icon-192.png');
  const img = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip('ポモドーロタイマー');

  const menu = Menu.buildFromTemplate([
    { label: '表示', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: '終了', click: () => { app.isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(menu);
  tray.on('click', () => {
    win.isVisible() ? win.focus() : win.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

// macOS: Dockアイコンクリックで再表示
app.on('activate', () => {
  if (win) win.show();
});

// 全ウィンドウを閉じてもアプリを終了しない（トレイに常駐）
app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return;
  // Windows/Linux はトレイ常駐のため何もしない
});
