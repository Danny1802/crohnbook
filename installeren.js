// Past het installatieblok aan op het toestel van de bezoeker.
//
// Op iOS bestaat geen manier om een webapp programmatisch te laten installeren:
// er is simpelweg geen knop voor. Het enige wat je kunt doen is de juiste
// instructie tonen — en dan is het de moeite waard om precies te weten in welke
// situatie iemand zit, want de instructies verschillen wezenlijk en een
// verkeerde instructie kost je de bezoeker.
//
// Zonder JavaScript blijft de variant "algemeen" staan. Die staat gewoon in de
// HTML en is wat een zoekmachine leest.
(function () {
  var blok = document.getElementById('install')
  if (!blok) return

  var ua = navigator.userAgent

  // iPadOS meldt zich sinds versie 13 als macOS. Een Mac met aanraakscherm
  // bestaat niet, dus die combinatie verraadt een iPad.
  var isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  var isIOS = /iPhone|iPod/.test(ua) || isIPad

  // Vensters binnen een andere app. Iemand die je link opent vanuit een
  // forumbericht of een socialemedia-app zit hier, en kan niets aan zijn
  // beginscherm toevoegen — hoe goed hij ook zoekt.
  var isInApp = /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Snapchat|Pinterest|Line\//i.test(ua)

  // Op iOS mag alleen Safari toevoegen aan het beginscherm. Chrome, Firefox en
  // Edge draaien daar op dezelfde motor maar missen die menuoptie.
  var isIOSAndereBrowser = isIOS && /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua)

  var isAndroid = /Android/.test(ua)

  var staatOpBeginscherm =
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)

  var stand
  if (staatOpBeginscherm) stand = 'geinstalleerd'
  else if (isInApp) stand = 'in-app'
  else if (isIOSAndereBrowser) stand = 'ios-anders'
  else if (isIOS) stand = 'ios-safari'
  else if (isAndroid) stand = 'android'
  else stand = 'desktop'

  blok.setAttribute('data-state', stand)

  // Het deelicoon zit op de iPhone onderin en op de iPad rechtsboven.
  if (stand === 'ios-safari' && isIPad) {
    var iphone = blok.querySelector('[data-plek="iphone"]')
    var ipad = blok.querySelector('[data-plek="ipad"]')
    if (iphone) iphone.hidden = true
    if (ipad) ipad.hidden = false
  }

  // Android en desktop-Chrome bieden een echte installatieknop. Die mag pas
  // verschijnen als de browser hem daadwerkelijk aanbiedt.
  var bewaardeMelding = null
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault()
    bewaardeMelding = e
    var knop = document.getElementById('android-installeer')
    var handmatig = document.getElementById('android-handmatig')
    if (!knop) return
    knop.hidden = false
    if (handmatig) handmatig.hidden = true
    if (stand === 'desktop') blok.setAttribute('data-state', 'android')
  })

  var installeerKnop = document.getElementById('android-installeer')
  if (installeerKnop) {
    installeerKnop.addEventListener('click', function () {
      if (!bewaardeMelding) return
      bewaardeMelding.prompt()
      bewaardeMelding = null
      installeerKnop.hidden = true
    })
  }

  // Adres kopiëren, met de uitkomst in de knop zelf zodat er geen melding
  // overheen hoeft te komen.
  Array.prototype.forEach.call(blok.querySelectorAll('[data-kopieer]'), function (knop) {
    var oorspronkelijk = knop.textContent
    knop.addEventListener('click', function () {
      var adres = knop.getAttribute('data-kopieer')
      var klaar = function () {
        knop.textContent = 'Gekopieerd'
        setTimeout(function () { knop.textContent = oorspronkelijk }, 2400)
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(adres).then(klaar, function () {
          knop.textContent = 'Kopiëren lukt niet — typ het adres over'
        })
      } else {
        knop.textContent = 'Kopiëren lukt niet — typ het adres over'
      }
    })
  })
})()
