const trackNotes = {
  greek: [
    ['De schaal van het voorbeeld', 'Vraag bij elke passage of het over één persoon, een polis of meerdere gemeenschappen gaat. In een decreet zie je bijvoorbeeld hoe één polis haar besluit formuleerde. Voor een uitspraak over een bredere praktijk heb je vergelijkingsmateriaal nodig uit andere plaatsen of uit andere momenten.'],
    ['De functie van de bron', 'Een publiek besluit richt zich tot een ander publiek dan een geschiedverhaal. Bepaal wie spreekt, tot wie, en wat de tekst wil bereiken. Lees ook de datering mee. Een veel latere auteur kan oudere tradities bewaren en tegelijk de verwachtingen van zijn eigen publiek weerspiegelen.'],
  ],
  roman: [
    ['Plaats, tijd en bevoegdheid', 'Bij een Romeins voorbeeld kan dezelfde handeling op verschillende niveaus worden geregeld. Breng eerst in kaart wie optreedt, waar het gebeurt en uit welke periode het bewijs komt. Een conflict in één stad zegt iets over die situatie. Met een vergelijking kun je vervolgens onderzoeken hoeveel daarvan ook elders geldt.'],
    ['Besluit en uitvoering', 'Een tekst kan laten zien wat werd bevolen of toegestaan. Voor de vraag wie het uitvoerde en met welke gevolgen is aanvullend bewijs nodig. Houd tijdens het lezen bij welke details je direct uit de tekst haalt en welke stappen in de uitvoering je op grond daarvan reconstrueert.'],
  ],
  history: [
    ['Gebeurtenis en verandering', 'Maak in je notities ruimte voor zowel een concrete gebeurtenis als het langere proces waarin ze past. Een datering geeft je een volgorde. Om een oorzakelijk verband te beargumenteren, leg je vervolgens uit hoe de ene ontwikkeling een andere kon beïnvloeden en welk bewijs die stap ondersteunt.'],
    ['Vergelijken draagt bij aan je verklaring', 'Kies eerst één vergelijkingspunt, zoals wie toegang had tot middelen of wie een besluit nam. Pas datzelfde criterium toe op de situaties die je vergelijkt. Beschrijf daarna welke verschillen in tijd, context of bron de vergelijking beperken.'],
  ],
  knowledge: [
    ['Van begrip naar toepassing', 'Zoek uit welke grootheid, categorie of relatie een begrip beschrijft. Leg daarna in een eigen voorbeeld uit welke informatie je nodig hebt en wat je met die informatie kunt bepalen. Een goed voorbeeld maakt ook duidelijk wanneer het begrip weinig helpt of wanneer een extra gegeven nodig is.'],
    ['Van resultaat naar controle', 'Controleer eerst of de eenheden, definities en uitgangspunten bij elkaar passen. Vraag daarna of de uitkomst logisch verandert wanneer je één gegeven wijzigt. Zo kun je een antwoord onderbouwen en herkennen bij welke stap een redenering of berekening gevoelig is voor fouten.'],
  ],
  fr: [
    ['Woordenschat in gebruik', 'Leer een naamwoord samen met zijn lidwoord. Zet een werkwoord in een korte zin en let op het voorzetsel dat ermee samengaat. Oefen daarna in twee richtingen. Begrijp eerst wat de Franse uitdrukking doet in een situatie en probeer vervolgens zelf te zeggen wat je nodig hebt.'],
    ['Grammatica en betekenis', 'Zoek in een zin eerst wie iets doet, wanneer het gebeurt en hoe zeker de spreker is. Daarmee kun je zien welke vorm het onderwerp, de tijd of een voorwaarde uitdrukt. Schrijf tot slot een eigen zin met dezelfde structuur en verander wie spreekt of waar de handeling plaatsvindt.'],
  ],
  it: [
    ['Van woorden naar een zin', 'Oefen een nieuwe uitdrukking als groep woorden. Plaats ze daarna in een situatie waarin je iets vraagt, toelicht of bevestigt. Let bij het hardop spreken op de plaats van het werkwoord en verander één onderdeel van je zin, zodat je de uitdrukking ook buiten het voorbeeld kunt gebruiken.'],
    ['Een passend antwoord vormen', 'Begin met wat je gesprekspartner nodig heeft om je te begrijpen. Voeg pas daarna de reden of het detail toe. Let op de aanspreekvorm en controleer of deze overeenkomt met je werkwoordsvorm. Lees je zin nog eens hardop als één geheel.'],
  ],
};

const situations = {
  labo: ['De functie van het materiaal', 'Orden de woorden op basis van wat je ermee doet, zoals afmeten, overbrengen, bewaren of registreren. In een verslag is het bovendien nuttig om te onderscheiden wat je hebt waargenomen, welk materiaal je gebruikte en welke verklaring nog openstaat. Zo weet de lezer wat er gecontroleerd kan worden.'],
  officine: ['Administratieve status precies doorgeven', 'Wanneer je iets overdraagt aan een collega, helpt een vaste volgorde. Beschrijf eerst wat er al geregistreerd of ontvangen is. Vermeld daarna welke informatie van een andere persoon komt en welke bevestiging je nog verwacht. Zo kan de volgende medewerker zien bij wie de volgende stap ligt.'],
  studie: ['Lezen met een doel', 'Bepaal eerst welke informatie je zoekt in een tekst, zoals een afspraak, een voorwaarde of de reikwijdte van een conclusie. Als je twee passages vergelijkt, noteer per passage het onderwerp en de vraag waarop ze antwoordt. Dan kun je gelijkenissen formuleren zonder verschillen tussen de passages te verliezen.'],
  winkel: ['Van productbeschrijving naar afspraak', 'Let op de woorden die naar een artikel, een bedrag of een voorwaarde verwijzen. Schrijf bij een klacht of vraag eerst concreet waarover het gaat en voeg er vervolgens aan toe welke oplossing je vraagt. Bij een promotie is het onderscheid tussen het bedrag in je mandje en de artikelen waarop de aanbieding geldt belangrijk.'],
  cafe: ['Van bestelling naar bevestiging', 'Noem wat je wilt en specificeer de hoeveelheid of het tijdstip. Vraag door als een voorwaarde onduidelijk is. Bij een groepsafspraak helpt het om aan het einde te herhalen wat al vastligt en welke gegevens je nog moet bevestigen.'],
};

export function studyNotes(lesson) {
  const situation = Object.hasOwn(situations, lesson.route) ? situations[lesson.route] : null;
  return [...(lesson.grammar && situation ? [situation] : []), ...(trackNotes[lesson.track] ?? [])];
}
