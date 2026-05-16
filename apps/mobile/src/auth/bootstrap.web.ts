// Before global.css loads: NativeWind web reads --css-interop-darkMode from :root.
// React Native StyleSheet has no setFlag on web; setting the variable avoids the
// "Cannot manually set color scheme, as dark mode is type 'media'" crash.
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--css-interop-darkMode', 'class dark')
}
