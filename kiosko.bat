@echo off

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk ^
  --no-first-run ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TouchpadOverscrollHistoryNavigation ^
  --disable-session-crashed-bubble ^
  --disable-infobars ^
  --disable-translate ^
  --disable-extensions ^
  --disable-popup-blocking ^
  --disable-back-forward-cache ^
  --autoplay-policy=no-user-gesture-required ^
  http://localhost:4173
