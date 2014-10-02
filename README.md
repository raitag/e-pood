# Elion e-pood, Hammr 
Kompileeritud failid asuvad Build kataloogis, tööfailid on juurkataloogis. Struktuur pärineb töövahendist - [Hammer](http://hammerformac.com).
Templiitimise abivahendiks on [Handlebars](http://handlebarsjs.com/), mis arenduse käigus asendatakse. Projekti aluseks on [Bootstrap 3 - Sass](https://github.com/twbs/bootstrap-sass/tree/master/vendor/assets/stylesheets/bootstrap), [rootslaste komponentidest](http://responsivecode.teliasonera.com/) on kasutusel moodulid. 

Stiilide failistruktuuri ülevaate annab styles.scss

Välised pluginad ja kogumikud lisaks bootstrapile (javascript)
  - Flexslider - rootslaste slider, kohandustega kasutusel kõigi roteeruvate komponentide juures
  - Froogaloop ja fitvid - Vimeo api Flexsliderile
  - Paintbrush - piltide multiply effekt. Sõltub Common js-st.
  - srcset - image replacement mediaqueries
  - modernizr - rootsist
  - enquire - rootsist, js brekapointid
  - jquery debouncing - rootsist
  - MatchMedia - rootsist

## Sisu

- Avaleht 
  - Avaslaider 
  - Tooteklotsidega avamenüü
  - Tooteslaider
  - Sisselogitud kasutaja - vaatamiseks vajuta "sisene" nuppu (NB! tooteslaideris on kehv ribboneid kasutada)
- 2nd level
  - Vertikaalne akordionmenüü 2 tasandit, hidden on small
  - Leivapuru (BS põhjal)
  - Tooteklotside vaade
  - Toote listvaade (custom, TSR põhjal)
- 3rd level 
  - Toote detailvaade desktopile

### Vaja teha veel esimese etapi raames: 
- Päis responsive loogika (Viljar seletagu)
- H1 kuni H6 jälgida
- Html-css refaktoreering
- Require js?
- Code Blocks?

### Andmesisestuses muutub kindlasti
- Avaslaideri sisestus (lisandub tekstiväli või mitu)
- 2nd level reklaami sisestus (pilt ja tekst eraldi)
- Lindi ja rombi sisestus
- Uus layout ei tolereeri valesti lõigatud pilte. Pildi suurus peab olema ruut.
- Pildi nimedes ei tohi olla tühikuid, süntaks product-name-number-direction-color.jpg 
- Star rating tuleb juurde
- Värvide sisestus: standardvärvid pluss kirjud värvid käsitsi lõigatuna pildist

### Sisulised küsimused, tähtsad täpsustused ja segased asjad
- Detailvaade - Ahto teeb edasi
- Rombide võimalikud variandid - keegi esitab
- Lintide võimalikud variandid - keegi esitab
- Värvivahetus listvaatesse ja detaili.
- Lehenumbreid ei tule, infinite scroll
- Praegu pole mobiiliversioonis on nähtav 3 tasand, probleem kui 2nd level vasak menüü pole nähtav mobiilis
- Detailvaates läheb lint roheliseks rombiks - teha. 
- Detailvaate suure pildi juurde jõudmine, Jaanuse mure, et suur pilt pole piisavalt suur.
- Sotsiaalmeedia ja ratingu paigutus


### Puudu on
- Filtrid
- Värvide esitluse komponent, otsus, kuidas esitada kirjusid värve

### Uued üldkasutatavad komponendid lisaks rootslastele (kohandatud BS või custom)
- Leivapuru
- Vertikaalne akordionmenüü
- Ümmargune badge ikooni või tekstiga
- Ribbon (lisatud ribbon mobiilile)
- Tootevärvid selektitavad
- Elioni logo skaleeruva svg-na, fallback png
- klass product mis teeb columnidega containerist TSR stiilile vastava paddinguteta layoudi
- rating
- kolmnurknoolega sektsioon 
- tootekarusell pisipiltidega
- piltide multiply (paintbrush js)
- h1-h6
- rombide paigutus järjekorral alusel, mitte fix ja minirombid
- ikooninupud

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

	
### Do-not-forget
- Kustmaalt image replacement.
- Kõrvalda horisontaalne scrollbar
