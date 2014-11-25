# Elion e-pood, Hammr 
Kompileeritud failid asuvad Build kataloogis, tööfailid on juurkataloogis. Struktuur pärineb töövahendist - [Hammer](http://hammerformac.com).
Templiitimise abivahendiks on [Handlebars](http://handlebarsjs.com/), mis arenduse käigus asendatakse. Projekti aluseks on [Bootstrap 3 - Sass](https://github.com/twbs/bootstrap-sass/tree/master/vendor/assets/stylesheets/bootstrap), [rootslaste komponentidest](http://responsivecode.teliasonera.com/) on kasutusel moodulid. 

Stiilide failistruktuuri ülevaate annab styles.scss

Välised javascriptipluginad ja kogumikud lisaks bootstrapile (javascript, asuvad Vendori all):

  - Flexslider - rootslaste slider, kohandustega kasutusel kõigi roteeruvate komponentide juures. Aeglane, plaanis vahetada BS3 slaideri vastu
  - wurfl - image replacement mediaqueries .net
  - [modernizr](http://modernizr.com/) - 
  - [enquire](http://wicky.nillia.ms/enquire.js/) - rootsist, js brekapointid
  - jquery debouncing - rootsist
  - [MatchMedia](https://github.com/paulirish/matchMedia.js/) - rootsist, peaks välja võtma sest Modernizr on juba
  - [bootstrap-rating](https://github.com/javiertoledo/bootstrap-rating-input) 
  - [bootstrap-slider](http://www.eyecon.ro/bootstrap-slider/)
  - [scrollto](http://flesler.blogspot.com/2007/10/jqueryscrollto.html)
  - [socialcount](https://github.com/filamentgroup/SocialCount)
  - [bootstrap-tabcollapse](https://github.com/flatlogic/bootstrap-tabcollapse/blob/master/bootstrap-tabcollapse.js)
  - [selectboxit](http://gregfranko.com/jquery.selectBoxIt.js/) peidab end forms.js-s, kasutada saab aga kõiki Greg Franko meetodeid
  - [lazyload](http://www.appelsiini.net/projects/lazyload) et pilte laetaks alles tarvidusel

## Sisu

Hammri lehe vasak ülamenüü punkt on Sisukord. See sisaldab kõiki lehti. Siin loetlen komponendid, mida lehelt leida saab koos väliste sõltuvustega. 
- Avaleht 
  - Avaslaider (Flexslider)
  - Kampaaniad (BS3 Collapse)
  - Sisupuu (BS3Collapse)
- Avaleht sisselogitud
  - Alertid (BS3 Alerts)
- Klotsvaade ja listvaade 2nd level
  - Vertikaalne akordionmenüü 2 tasandit, hidden on small
  - Leivapuru (BS põhjal)
  - Filter
  - Ajax loader
  - Lemmiku valik (BS3 Dropdown)
- Erilehed
  - Võrdlus (scrollto)
  - Lemmikud
  - Ostingutulemus
  - Hooldusinfo
  - Abi
- Detailvaade 3rd level 
  - Transpordi akordion (BS3 Collapse)
  - Thumbidega tootekarussell, avaneb modaaliks desktopil (Flexslider, BS3 Modal)
  - Seonduvate toodete akordion kustom-checkide-radiotega
  - Tabides lisainfo (BS3 Tab, bootstrap-tabcollapse)
  - Sotsiaalmeedia (socialcount)
  - Arvamused (BS3 Collapse)
  - Tooteinfo tabel (BS3 Tooltip, BS3 Popover)


### Andmesisestuses palun järgida:
- Pildi nimedes ei tohi olla tühikuid, süntaks product-name-number-direction-color.jpg st

### Töös on
- Ostukorv

## Ostukorv
Ainult ostukorvile vajalik javascript on failis _js-cart.html ja lisandunud css failis _css-cart.html
- [typeahead.js](http://twitter.github.io/typeahead.js/) autocomplete jaoks
- varasemast SelectBoxIt ilusate selectide jaoks. NB! Ei mängi kokku x-editable pluginaga (töötab Select2-ga)
- [x-Editable](http://vitalets.github.io/x-editable/index.html) vormide inline muutmiseks
- kalendri ja kella jaoks ilus [pickadate.js](http://amsul.ca/pickadate.js/). Tuleb veel lilla teema teha, lessi failid selle jaoks olemas.


[on-off switch](http://proto.io/freebies/onoff/) on puhas css. Ei pruugi IE8-ga töötada, st ei tööta, Operaga ka, aga all on checkbox mis peaks töötama. Kontrollida tingimata!
IE8 issue on veel, et ostukorvis peaks keskele joondumine katki minema, see on okei ja nii plaanitud, ei muuda kasutatavust. 

### Tulekul on
- Filtrid külgmenüüsse (mobiilivaade?) 
- Uus päis
- Sisseloginud klient


### Juhtnöörid koodi oma projektis kasutamiseks:
  - All on BS3, siis rootsi scss, siis eesti kohendused.
  - Iga komponent on eraldi html-jupike, millele käib kaasa eraldi scss ja js (nagu rootslastel)
  - Juurkataloogis on põhilehed, mis includevad jupikesi
  - html-jupikesed asuvad `_includes/..`
  - Vastav scss asub `assets/css/_ee-elion/..`
  - Vastav js asub `assets/js/_ee-js/..`
  htmlis on sees Handlebarsi templated. Pure htmli saamiseks tuleb loogeliste sulgude sees asuv kola asendada teksti või labeliga. Inspiratsiooni saab `assets/data/handlebars/*.hbs` failidest (json). Lisaks tuleb script-tagi sees olev jupp tõsta eelneva tühja divi sisse, mille id-s sisaldub sõna `-placeholder-`.


### Abivahendid, suurelt jaolt eksperimentaalsed:
- uued ikoonid, mida Ahto juurde teeb lisaks rootslaste omale ka [Fontasticus](http://fontastic.me/). Ligipääsud annab Ahto - see on siiski avalik repo.
- [grunt](http://gruntjs.com/)
	- [grunt responsive-images](https://github.com/andismith/grunt-responsive-images)
	- meediapäringute sortimiseks [grunt-combine-media-queries](https://github.com/buildingblocks/grunt-combine-media-queries)
- meediapäringitele vastavate pildisuurste serveerimiseks [srcset-polyfill](https://github.com/borismus/srcset-polyfill)
