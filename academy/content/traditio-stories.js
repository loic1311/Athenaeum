// Brongebonden verhalen met verwijzingen per versie en per figuurrelatie.
export const additionalStories = [
  {
    "id": "tr-westcar-djedi",
    "tradition": "Egyptische religie",
    "cycle": "Cheops en de drie koningskinderen",
    "title": "Een geleerde spreekt Cheops tegen",
    "source": [
      {
        "label": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 6.22–9.21 (Engelse vertaling, Bibliotheca Alexandrina)",
        "url": "https://inscriptionslibrary.bibalex.org/Presentation/Monument.aspx?INS_ID=13&Lang=en&MON_ID=2857"
      },
      {
        "label": "Ägyptisches Museum und Papyrussammlung, Berlijn, P 3033 (objectcatalogus en afbeelding)",
        "url": "https://search.smb.museum/object/obj-606402"
      }
    ],
    "context": "De Papyrus Westcar vertelt hoe prinsen verhalen voordragen voor koning Cheops. Met prins Hordjedef verandert het spel. Hij kent iemand die de koning zelf kan ontmoeten. De papyrus plaatst de handeling aan een historisch hof uit het Oude Rijk. Hij laat zich lezen als een vertelling over de grenzen van koninklijke macht. De samenspraak is geen bewaard hofverslag.",
    "narrative": [
      "Hordjedef reist naar Djedi, een oude man aan wie buitengewone kennis wordt toegeschreven. Hij nodigt hem uit aan het hof. Djedi vraagt ruimte voor zijn kinderen en zijn boeken en gaat met de prins mee. Tegenover Cheops legt hij uit waarom de koning hem nooit eerder heeft gezien. Iemand kan pas aan het hof verschijnen wanneer hij wordt ontboden. De ontmoeting begint dus met een korte opmerking over de manier waarop een hof zelf toegang organiseert.",
      "Cheops wil Djedi op de proef stellen. Wanneer de vorst daartoe een gevangene wil laten doden, protesteert zijn gast. De demonstratie gaat met dieren door. Vervolgens vraagt Cheops naar de geheime vertrekken van Thot. Djedi trekt een precieze grens rond zijn kennis. Hij kent hun aantal niet, maar weet waar informatie erover is ondergebracht, in Heliopolis. Hij vertelt ook waarom hij de koning die informatie niet eigenhandig kan bezorgen.",
      "De oudste van drie nog ongeboren kinderen van Reddjedet zal dit doen. Djedi noemt hen kinderen van de zonnegod Re en kondigt hun toekomstig koningschap aan. Cheops wordt somber. Eerst zullen nog zijn eigen zoon en diens zoon regeren, voegt de geleerde eraan toe. De koning heeft een antwoord op zijn oorspronkelijke vraag gekregen, maar hij heeft tegelijk gehoord dat het hoogste ambt zijn eigen lijn zal verlaten."
    ],
    "interpretation": "Doordat de koning de proef en de vragen kiest, lijkt hij aan het begin de uitkomst in handen te hebben. De bezoeker bepaalt welke proef aanvaardbaar is en wat hij verantwoord kan verklaren. Lees de voorspelling naast de volgende geboorte-episode. De lezer ziet daar waar worden wat het personage aankondigt. Dat is een literaire bevestiging binnen dezelfde tekst en geen onafhankelijke controle van een koninklijke afstamming.",
    "figures": [
      "Cheops",
      "Hordjedef",
      "Djedi",
      "Reddjedet",
      "Re"
    ],
    "relations": [
      {
        "from": "Hordjedef",
        "to": "Cheops",
        "label": "zoon van",
        "source": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 6.22–9.21 (Engelse vertaling, Bibliotheca Alexandrina)"
      },
      {
        "from": "Hordjedef",
        "to": "Djedi",
        "label": "nodigt hem uit aan het hof",
        "source": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 6.22–9.21 (Engelse vertaling, Bibliotheca Alexandrina)"
      },
      {
        "from": "Djedi",
        "to": "Reddjedet",
        "label": "voorspelt het koningschap van haar kinderen",
        "source": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 6.22–9.21 (Engelse vertaling, Bibliotheca Alexandrina)"
      }
    ],
    "questions": [
      {
        "prompt": "Welke beperking geeft Djedi aan wanneer Cheops naar het heiligdom van Thot vraagt?",
        "options": [
          "Hij kent het aantal vertrekken maar verzwijgt de plaats.",
          "Hij kent het aantal niet, maar weet waar de informatie te vinden is.",
          "Hij heeft geen weet van een heiligdom in Heliopolis."
        ],
        "answer": 1,
        "explanation": "Het onderscheid tussen inhoud, bewaarplaats en degene die de informatie zal bezorgen leidt het verhaal naar de ongeboren kinderen."
      },
      {
        "prompt": "Welke gebeurtenis maakt de koning somber?",
        "options": [
          "De aankondiging dat de kinderen van Reddjedet zullen regeren",
          "Het vertrek van zijn zoon naar Heliopolis",
          "De terugkeer van de sprekende dieren"
        ],
        "answer": 0,
        "explanation": "Cheops moet zijn belangstelling voor geheime kennis verbinden aan de grenzen van zijn eigen dynastie."
      }
    ],
    "essay": {
      "prompt": "Verklaar hoe een hofverhaal over bijzondere kennis overgaat in een verhaal over koninklijke opvolging.",
      "criteria": [
        "Bespreek een vraag waarop Djedi de koning tegenspreekt of zijn kennis begrenst.",
        "Leg uit door wie de koning de informatie zal ontvangen.",
        "Onderscheid de voorspelling in het verhaal van een bron over de historische dynastie."
      ]
    }
  },
  {
    "id": "tr-westcar-geboorte",
    "tradition": "Egyptische religie",
    "cycle": "Cheops en de drie koningskinderen",
    "title": "Waarom er kronen in een zak gerst liggen",
    "source": [
      {
        "label": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 9.21–12.26 (Engelse vertaling, Bibliotheca Alexandrina)",
        "url": "https://inscriptionslibrary.bibalex.org/Presentation/Monument.aspx?INS_ID=13&Lang=en&MON_ID=2857"
      },
      {
        "label": "Ägyptisches Museum und Papyrussammlung, Berlijn, P 3033, kol. X–XII op de keerzijde",
        "url": "https://search.smb.museum/object/obj-792730"
      }
    ],
    "context": "Na de voorspelling aan Cheops verplaatst de Papyrus Westcar de lezer van het hof naar het huis van Reddjedet. Zij is de echtgenote van een priester van Re. Uitgerekend in dat huishouden speelt de geboorte van drie toekomstige koningen zich af. Drie keer keren dezelfde handelingen terug. Door de herhaling is bij ieder kind duidelijk welk gezag het krijgt.",
    "narrative": [
      "Reddjedet heeft een moeilijke bevalling. Re stuurt Isis, Nephthys, Meskhenet, Heqet en Chnoem. De toekomstige vorsten zullen immers tempels bouwen en hun altaren van offers voorzien. De godinnen komen als muzikanten aan. Chnoem draagt de bagage. De echtgenoot van Reddjedet krijgt dus gewone bezoekers te zien, die zeggen dat zij kunnen helpen bij een geboorte. Hij laat hen binnen.",
      "Isis en Nephthys nemen ieder hun plaats in. Heqet bespoedigt de geboorte. Bij ieder kind spreekt Isis woorden uit die verband houden met de naam. Het bijzondere lichaam van de pasgeborene wordt telkens beschreven. Meskhenet kondigt het koningschap aan en Chnoem zorgt voor het lichaam. De goddelijke handelingen vullen elkaar aan. Geen van de kinderen verwerft zijn positie hier door al iets te hebben gepresteerd.",
      "De vader biedt de bezoekers een zak gerst aan. Na hun vertrek leggen zij er drie kronen in en keren onder voorwendsel van slecht weer terug. De zak wordt bij de familie in bewaring gegeven. Als er thuis gerst nodig is, hoort een dienares muziek en feestgedruis. Reddjedet legt haar hoofd tegen de zak en begrijpt waar het geluid vandaan komt. Ze bergt de zak zorgvuldig op. Later dreigt de dienares na een conflict haar verhaal aan Cheops te vertellen. Het bewaarde slot is beschadigd. De lezer kan daardoor geen volledige afloop reconstrueren."
    ],
    "interpretation": "De goden geven zelf een reden voor hun optreden. Het koningschap zal hun cultus materieel onderhouden. De omgekeerde beweging is even belangrijk. De mensen ontvangen de goden als bezoekers, waarna de betaling voor hun diensten verandert in een teken van komende heerschappij. De vertelling maakt koninklijke legitimiteit zichtbaar in een huishoudelijk voorwerp. Een historicus die het kroningsritueel of de afstamming van een historische koning onderzoekt, heeft daarnaast eigentijdse bronnen nodig.",
    "figures": [
      "Re",
      "Reddjedet",
      "Isis",
      "Nephthys",
      "Meskhenet",
      "Heqet",
      "Chnoem"
    ],
    "relations": [
      {
        "from": "Re",
        "to": "Isis",
        "label": "stuurt haar naar Reddjedet",
        "source": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 9.21–12.26 (Engelse vertaling, Bibliotheca Alexandrina)"
      },
      {
        "from": "Heqet",
        "to": "Reddjedet",
        "label": "helpt haar bij de bevalling",
        "source": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 9.21–12.26 (Engelse vertaling, Bibliotheca Alexandrina)"
      },
      {
        "from": "Meskhenet",
        "to": "Reddjedet",
        "label": "kondigt het koningschap van haar kinderen aan",
        "source": "Anoniem, Papyrus Westcar, Berlijn P 3033, kol. 9.21–12.26 (Engelse vertaling, Bibliotheca Alexandrina)"
      }
    ],
    "questions": [
      {
        "prompt": "Waarom stuurt Re helpers naar Reddjedet?",
        "options": [
          "De koning had hem bevolen de kinderen naar het paleis te brengen.",
          "De kinderen zullen later de tempels en offers van de goden onderhouden.",
          "De dienares heeft de verdwenen kronen al gevonden."
        ],
        "answer": 1,
        "explanation": "Re legt in zijn opdracht een verband tussen goddelijke bijstand en het toekomstige optreden van de koningen."
      },
      {
        "prompt": "Wie ontdekt waar de koninklijke feestgeluiden vandaan komen?",
        "options": [
          "Djedi vindt in het paleis een archief.",
          "De dienares opent de zak en draagt de kronen.",
          "Reddjedet legt haar hoofd tegen de gerstzak nadat de dienares iets heeft gehoord."
        ],
        "answer": 2,
        "explanation": "De ontdekking verloopt in twee stappen. De dienares hoort iets, Reddjedet lokaliseert het geluid."
      }
    ],
    "essay": {
      "prompt": "Hoe bouwt de schrijver van een gewone betaling aan bezoekers een teken van goddelijke legitimiteit?",
      "criteria": [
        "Volg de zak gerst vanaf de schenking tot de ontdekking.",
        "Leg uit waarom de personages verschillende dingen weten.",
        "Betrek de aangekondigde relatie tussen koningen en de tempels in je antwoord."
      ]
    }
  },
  {
    "id": "tr-demeter-verdwijning",
    "tradition": "Griekse mythologie",
    "cycle": "Demeter en Persephone",
    "title": "Wie hoorde Persephone verdwijnen?",
    "source": [
      {
        "label": "Anoniem, Homerische hymne aan Demeter, vv. 1–89 (vert. Gregory Nagy)",
        "url": "https://www-current.chs.harvard.edu/primary-source/homeric-hymn-to-demeter-sb/"
      }
    ],
    "context": "De anonieme Homerische hymne aan Demeter vertelt vanaf de eerste verzen dat Zeus heeft ingestemd met het huwelijk tussen Hades en Persephone. Demeter ontdekt dit pas later. Het verschil tussen wat de lezer weet en wat de moeder te weten kan komen, bepaalt hoe het verhaal verloopt.",
    "narrative": [
      "Persephone is met andere meisjes bloemen aan het plukken. Haar aandacht gaat naar een uitzonderlijke narcis. Gaia heeft hem laten groeien volgens het plan van Zeus, ten gunste van Hades. Wanneer het meisje haar handen uitstrekt, opent de aarde zich. Hades neemt haar mee op zijn wagen. Ze roept haar vader Zeus maar krijgt van hem geen hulp. Zolang zij nog de wereld van de levenden kan zien, blijft zij hopen haar moeder terug te vinden. Haar geroep bereikt Demeter.",
      "Demeter scheurt haar hoofdbedekking en trekt met fakkels de wereld rond. Negen dagen zoekt ze zonder godenspijs of -drank te gebruiken. De tiende ochtend ontmoet ze Hekate. Die heeft de roep gehoord, maar de ontvoering niet gezien. Samen gaan ze naar Helios. De zonnegod kan haar meer vertellen. Hij noemt zowel de man die haar dochter meenam als degene die de toestemming gaf. Hij probeert Demeter gerust te stellen door te wijzen op de rang van de bruidegom.",
      "De uitleg maakt Demeter vooral boos op Zeus. Zij trekt weg uit de kring van de goden. Een overeenkomst tussen machtige verwanten heeft haar dochter en haarzelf voor een voldongen feit geplaatst. Door voorlopig tussen de mensen te gaan leven, kan Demeter haar plaats als godin van de vruchtbaarheid aan de andere goden gaan onthouden."
    ],
    "interpretation": "De verteller legt de gebeurtenis eerst van bovenaf uit en laat haar dan reconstrueren door iemand die er van buitenaf achteraan moet. Helios neemt genoegen met de uitleg van het huwelijk als een eervolle regeling. Demeters reactie toont welke belangen die uitleg buiten beschouwing laat. Voor concrete huwelijkspraktijken in afzonderlijke Griekse steden zouden andere bronnen nodig zijn.",
    "figures": [
      "Persephone",
      "Demeter",
      "Hades",
      "Zeus",
      "Hekate",
      "Helios"
    ],
    "relations": [
      {
        "from": "Demeter",
        "to": "Persephone",
        "label": "moeder van",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 1–89 (vert. Gregory Nagy)"
      },
      {
        "from": "Hades",
        "to": "Persephone",
        "label": "voert haar mee",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 1–89 (vert. Gregory Nagy)"
      },
      {
        "from": "Hekate",
        "to": "Demeter",
        "label": "helpt zoeken",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 1–89 (vert. Gregory Nagy)"
      },
      {
        "from": "Helios",
        "to": "Demeter",
        "label": "vertelt wie instemde",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 1–89 (vert. Gregory Nagy)"
      }
    ],
    "questions": [
      {
        "prompt": "Waarom ondervraagt Demeter na Hekate ook Helios?",
        "options": [
          "Hekate hoorde de roep, maar zag de ontvoerder niet.",
          "Helios had Demeter naar Eleusis gestuurd.",
          "Hekate had een verkeerde dader aangewezen."
        ],
        "answer": 0,
        "explanation": "De hymne onderscheidt horen en zien. De twee getuigen kunnen dus verschillende informatie verstrekken."
      },
      {
        "prompt": "Wat weet de lezer eerder dan Demeter?",
        "options": [
          "Hoe de latere regeling eruitziet",
          "Dat Zeus de afspraak met Hades goedkeurde",
          "Waar de eerste tempel zal worden gebouwd"
        ],
        "answer": 1,
        "explanation": "De rol van Zeus is al in de opening vermeld. Demeter hoort die pas via Helios."
      }
    ],
    "essay": {
      "prompt": "Leg uit waarom dezelfde onthulling voor Helios en Demeter verschillende gevolgen heeft.",
      "criteria": [
        "Noem de rollen van Zeus en Hades.",
        "Leg uit wat Helios over het huwelijk vindt.",
        "Verbind Demeters reactie met haar vertrek."
      ]
    }
  },
  {
    "id": "tr-demeter-eleusis",
    "tradition": "Griekse mythologie",
    "cycle": "Demeter en Persephone",
    "title": "Een onbekende vrouw aan de haard van Eleusis",
    "source": [
      {
        "label": "Anoniem, Homerische hymne aan Demeter, vv. 90–304 (vert. Gregory Nagy)",
        "url": "https://www-current.chs.harvard.edu/primary-source/homeric-hymn-to-demeter-sb/"
      }
    ],
    "context": "In Eleusis, ten westen van Athene, richt de hymne de aandacht op een huisgezin. Demeter verschijnt als oudere vrouw bij een waterplaats. De mensen die haar aanspreken kennen haar identiteit en bedoelingen niet. Hetzelfde gebaar kan voor hen dus iets anders betekenen dan voor de lezer.",
    "narrative": [
      "Dochters van Keleos ontmoeten de onbekende. Demeter vertelt dat zij uit Kreta komt en aan zeerovers is ontsnapt. Zij zoekt werk dat bij een oudere vrouw past. De meisjes brengen haar bij hun moeder Metaneira. Die zoekt iemand om haar zoontje te verzorgen. Iambe brengt de eerst nog zwijgzame gast met scherts aan het lachen. Wanneer men haar wijn aanbiedt, vraagt Demeter om water met gerst en polei. Metaneira laat het mengsel bereiden.",
      "Demeter neemt Demophon in haar zorg. De kleine groeit op een manier die zijn ouders niet kunnen verklaren. De godin zalft hem met ambrozijn en legt hem 's nachts in het vuur. Door die behandeling wil ze hem onsterfelijk maken. Metaneira ziet het en schreeuwt. Wat de moeder als een onmiddellijk gevaar waarneemt, is in de kennis van de lezer een poging het kind voor de dood te behoeden. Haar ingreep onderbreekt de handeling.",
      "Demeter maakt bekend wat het kind voortaan moet missen en wie de geheimzinnige verzorgster werkelijk is. Ze verlangt in Eleusis een tempel en een altaar en zal de mensen leren welke riten haar toekomen. Keleos laat de inwoners bouwen. Wanneer het heiligdom klaar is, trekt Demeter zich er terug. Het gezin heeft haar identiteit ontdekt, maar de godin wacht nog steeds op haar dochter."
    ],
    "interpretation": "De episode vormt een verklaring voor de plaatselijke verering van Demeter. Een detail uit het gedicht, zoals het gerstdrankje, kan aanleiding geven tot een vraag over rituelen. Om te weten wat op een bepaalde datum in Eleusis werd gedronken, zijn ook onafhankelijke, dateerbare getuigenissen nodig. De hymne laat vooral zien hoe men het ontstaan van een cultus aan een episode uit het leven van de godin kon verbinden.",
    "figures": [
      "Demeter",
      "Metaneira",
      "Demophon",
      "Keleos",
      "Iambe"
    ],
    "relations": [
      {
        "from": "Metaneira",
        "to": "Demophon",
        "label": "moeder van",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 90–304 (vert. Gregory Nagy)"
      },
      {
        "from": "Demeter",
        "to": "Demophon",
        "label": "verzorgt het kind",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 90–304 (vert. Gregory Nagy)"
      },
      {
        "from": "Iambe",
        "to": "Demeter",
        "label": "laat haar lachen",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 90–304 (vert. Gregory Nagy)"
      }
    ],
    "questions": [
      {
        "prompt": "Waarom onderbreekt Metaneira Demeters handeling?",
        "options": [
          "Het kind blijkt al onsterfelijk.",
          "Zij ziet wat er met haar kind gebeurt, maar kent het doel van de godin niet.",
          "Keleos heeft de verzorgster verboden ooit nog bij het kind te komen."
        ],
        "answer": 1,
        "explanation": "De handeling lijkt gevaarlijk voor een mens die de bedoeling en identiteit van de verzorgster niet kent."
      },
      {
        "prompt": "Wat gebeurt na de onthulling van Demeters identiteit?",
        "options": [
          "De bewoners bouwen een tempel en altaar voor haar.",
          "Het kind wordt koning van de onderwereld.",
          "Metaneira onderhandelt met Zeus."
        ],
        "answer": 0,
        "explanation": "De vraag wat er met één huishouden gebeurt, leidt nu naar een verhaal over een heiligdom van de hele gemeenschap."
      }
    ],
    "essay": {
      "prompt": "Beschrijf de stap van een huishoudelijk conflict naar het ontstaan van een plaatselijke cultus.",
      "criteria": [
        "Maak duidelijk waarom de identiteit van de gast ertoe doet.",
        "Vergelijk de twee perspectieven op het vuur.",
        "Leg uit wat de gemeenschap na de onthulling moet doen."
      ]
    }
  },
  {
    "id": "tr-demeter-terugkeer",
    "tradition": "Griekse mythologie",
    "cycle": "Demeter en Persephone",
    "title": "Het graan, de granaatappel en de terugkeer",
    "source": [
      {
        "label": "Anoniem, Homerische hymne aan Demeter, vv. 305–495 (vert. Gregory Nagy)",
        "url": "https://www-current.chs.harvard.edu/primary-source/homeric-hymn-to-demeter-sb/"
      }
    ],
    "context": "Zolang Demeter zich terugtrekt, laat de aarde niets meer groeien. Daardoor raakt de ontvoering ook mensen die niets over de goddelijke afspraken te zeggen hadden. De goden dreigen op hun beurt de offers kwijt te raken die mensen hun brengen. De gebroken familieverhouding vraagt daarmee om een oplossing voor een veel groter probleem.",
    "narrative": [
      "Boeren ploegen en zaaien tevergeefs. Zeus zendt eerst Iris en daarna andere goden om Demeter naar hun gezelschap terug te halen. Zij wil geen eerbewijzen aannemen zolang zij haar dochter niet heeft gezien. Hermes gaat naar Hades. Die laat Persephone vertrekken en wijst haar op de eer die zij in zijn rijk zal genieten. Voor zij vertrekt geeft hij haar van een granaatappel te eten.",
      "Hermes brengt moeder en dochter opnieuw samen. Wanneer Persephone zelf vertelt wat er beneden gebeurde, zegt zij haar moeder dat Hades haar dwong te eten. Nu kan zij zich niet volledig aan het dodenrijk onttrekken. Uiteindelijk brengt zij een derde van het jaar daar door en twee derde bij haar moeder en de andere goden. Rhea brengt de regeling over aan Demeter en haalt haar ertoe over de aarde weer vrucht te laten dragen.",
      "Het slot brengt de lezer terug naar Eleusis. Demeter toont er plaatselijke leiders de riten. De dichter geeft aan dat ingewijden een bijzondere bestemming wacht en dat bepaalde dingen niet mogen worden prijsgegeven. Het gedicht verklaart zo zowel de terugkeer van het gewas als het belang van deelname aan de rituelen. De aandacht voor voedsel loopt van de misoogst over één doorslaggevende vrucht naar de hernieuwde oogst."
    ],
    "interpretation": "In het handschrift ontbreken rond vv. 387–400 delen van de hereniging. Vertaler Gregory Nagy markeert de leemte in zijn editie. Het slot waarin Rhea de afspraak overbrengt geeft onafhankelijk van de beschadigde regels binnen het gedicht houvast voor de verdeling van het jaar. De jaarlijkse verhouding verdient precieze lezing. In deze hymne gaat het uitdrukkelijk om een derde en twee derde.",
    "figures": [
      "Demeter",
      "Persephone",
      "Hades",
      "Hermes",
      "Rhea",
      "Zeus"
    ],
    "relations": [
      {
        "from": "Hermes",
        "to": "Persephone",
        "label": "begeleidt haar terug",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 305–495 (vert. Gregory Nagy)"
      },
      {
        "from": "Hades",
        "to": "Persephone",
        "label": "geeft haar van de granaatappel",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 305–495 (vert. Gregory Nagy)"
      },
      {
        "from": "Rhea",
        "to": "Demeter",
        "label": "brengt de regeling over",
        "source": "Anoniem, Homerische hymne aan Demeter, vv. 305–495 (vert. Gregory Nagy)"
      }
    ],
    "questions": [
      {
        "prompt": "Welke verhouding noemt deze hymne voor Persephones verblijf?",
        "options": [
          "Een halfjaar in elk rijk",
          "Twee derde van het jaar in de onderwereld",
          "Een derde in de onderwereld en twee derde bij haar moeder en de goden"
        ],
        "answer": 2,
        "explanation": "Het slot herneemt de afspraak in het bericht dat Rhea aan Demeter overbrengt."
      },
      {
        "prompt": "Waarom maakt de misoogst Zeus' positie moeilijk?",
        "options": [
          "De goden verliezen de offers als de mensen omkomen.",
          "Hades kan de mislukte oogst kopen.",
          "De boeren sturen hun ploeg naar de Olympus."
        ],
        "answer": 0,
        "explanation": "De tekst maakt menselijke voedselvoorziening en goddelijke eerbewijzen van elkaar afhankelijk."
      }
    ],
    "essay": {
      "prompt": "Hoe verbindt het slot het herstel van een familieverhouding met landbouw en cultus?",
      "criteria": [
        "Maak de betekenis van de misoogst voor de goden duidelijk.",
        "Noem de precieze jaarlijkse regeling.",
        "Onderscheid het zichtbare herstel van het gewas van wat de tekst aan ingewijden voorbehoudt."
      ]
    }
  },
  {
    "id": "tr-romulus-huwelijk",
    "tradition": "Romeinse overleveringen",
    "cycle": "De stichting van Rome",
    "title": "Een feest met gewelddadige gevolgen",
    "source": [
      {
        "label": "Titus Livius, Ab urbe condita 1.8–10 (Latijn)",
        "url": "https://www.thelatinlibrary.com/livy/liv.1.shtml"
      },
      {
        "label": "Titus Livius, Ab urbe condita 1.8–10 (Latijn en Engelse vertaling)",
        "url": "https://adfonteslibrary.org/work-livy-history-1-10"
      }
    ],
    "context": "In het eerste boek van zijn geschiedenis vraagt Livius hoe een pas gestichte nederzetting kon voortbestaan. Romulus heeft mensen aangetrokken en een bestuur ingericht. Nu rijst een vraag die bij deze schrijver even politiek als familiaal is. Hoe kan de stad voortbestaan wanneer haar buren weigeren huwelijksbanden met haar inwoners aan te gaan?",
    "narrative": [
      "Romulus stuurt gezanten naar de buurvolken. Die moeten om een verbond en wederzijdse huwelijksmogelijkheden vragen. De gezanten krijgen een afwijzing en volgens Livius zelfs spottende antwoorden. Voor de jonge gemeenschap staat haar erkenning door haar omgeving op het spel. De koning besluit een feest te organiseren met spelen voor Neptunus Equester. Het bericht lokt mensen uit verschillende steden en Sabijnse families naar Rome.",
      "Op een afgesproken teken grijpen Romeinse mannen de aanwezige jonge vrouwen. De gasten vluchten. Het optreden krijgt extra gewicht doordat de Romeinen mensen die voor een feest bij hen te gast zijn, slecht behandelen. De ouders spreken over geschonden gastvrijheid en roepen de goden aan. Livius laat Romulus een ander argument naar voren schuiven. Hij beweert dat de weigering van de vaders dit heeft veroorzaakt en probeert de vrouwen voor het vooruitzicht van een huwelijk en kinderen te winnen.",
      "De leidraad voor de volgende hoofdstukken is de vraag wie kan beslissen over familiebanden. De buren hadden een formeel verzoek afgewezen. De Romeinen hebben daarop een eigen beslissing met dwang uitgevoerd. Woorden over toekomstige verwantschap wissen de aanleiding van het conflict niet uit. De buitenlandse families zullen proberen de vrouwen terug te krijgen."
    ],
    "interpretation": "Livius schrijft vele eeuwen na de tijd waarin hij deze scène plaatst. Zijn verdeling van argumenten over koning, ouders en vrouwen is bruikbaar om te onderzoeken welke belangen een Romeins oorsprongsverhaal tegenover elkaar zet. Of de stichting van de stad werkelijk op deze manier verliep, kan de scène niet aantonen. Let ook op voor wie Livius een rechtstreekse verdediging formuleert en wiens reactie vooral door de verteller wordt weergegeven.",
    "figures": [
      "Romulus",
      "Romeinse mannen",
      "Sabijnse vrouwen",
      "Sabijnse verwanten"
    ],
    "relations": [
      {
        "from": "Romulus",
        "to": "Romeinse mannen",
        "label": "geeft het afgesproken teken",
        "source": "Titus Livius, Ab urbe condita 1.8–10 (Latijn)"
      },
      {
        "from": "Romeinse mannen",
        "to": "Sabijnse vrouwen",
        "label": "ontvoeren de aanwezige jonge vrouwen",
        "source": "Titus Livius, Ab urbe condita 1.8–10 (Latijn)"
      },
      {
        "from": "Sabijnse verwanten",
        "to": "Sabijnse vrouwen",
        "label": "verwanten van",
        "source": "Titus Livius, Ab urbe condita 1.8–10 (Latijn)"
      }
    ],
    "questions": [
      {
        "prompt": "Welke poging onderneemt Romulus vóór de spelen?",
        "options": [
          "Hij biedt zijn koningschap aan Titus Tatius aan.",
          "Hij vraagt zijn buren om een verbond en om wederzijdse huwelijksbanden.",
          "Hij legt een eed af bij de grafheuvel van Remus."
        ],
        "answer": 1,
        "explanation": "De afwijzing van de gezanten vormt de directe aanleiding voor Romulus' volgende plan."
      },
      {
        "prompt": "Waarom maakt het feest de geweldpleging extra problematisch voor de gasten?",
        "options": [
          "De gastheren schenden de verwachtingen van gastvrijheid.",
          "De vrouwen mochten gewoonlijk geen feesten bezoeken.",
          "De spelen werden buiten de stad gehouden."
        ],
        "answer": 0,
        "explanation": "Livius laat de families tegenover de plannen van Romulus juist de geschonden gastrelatie inroepen."
      }
    ],
    "essay": {
      "prompt": "Vergelijk de verdediging van Romulus met de klacht van de families. Wat staat er voor beide op het spel?",
      "criteria": [
        "Situeer de geweigerde onderhandeling vóór het feest.",
        "Onderbouw beide lezingen met een concrete handeling.",
        "Leg uit hoe Livius' manier van vertellen de hoorbaarheid van beide partijen beïnvloedt."
      ]
    }
  },
  {
    "id": "tr-romulus-bemiddeling",
    "tradition": "Romeinse overleveringen",
    "cycle": "De stichting van Rome",
    "title": "De Sabijnse vrouwen onderbreken de strijd",
    "source": [
      {
        "label": "Titus Livius, Ab urbe condita 1.11–13 (Latijn)",
        "url": "https://www.thelatinlibrary.com/livy/liv.1.shtml"
      },
      {
        "label": "Titus Livius, Ab urbe condita 1.11–13 (Latijn en Engelse vertaling)",
        "url": "https://adfonteslibrary.org/work-livy-history-1-10"
      }
    ],
    "context": "De vrouwen die bij de Romeinse spelen zijn ontvoerd, hebben in de tussentijd een dubbele plaats in de vertelling gekregen. Zij hebben verwanten aan Sabijnse zijde en echtgenoten en kinderen in Rome. Juist die positie wordt doorslaggevend wanneer de strijd in het dal tussen de Romeinse heuvels dreigt door te gaan.",
    "narrative": [
      "De Sabijnen onder Titus Tatius weten de Romeinse burcht in handen te krijgen. Livius vertelt in dit verband over Tarpeia en bewaart uiteenlopende verklaringen voor haar motief. De volgende dag vechten Romeinen en Sabijnen. Na de dood van een Romeinse aanvoerder wijken de Romeinen terug. Romulus bidt tot Jupiter en belooft een heiligdom als zijn mannen standhouden. De strijd keert, maar daarmee is nog geen vrede ontstaan.",
      "De Sabijnse vrouwen verschijnen met loshangend haar en gescheurde kleding tussen de strijdenden. Zij spreken zowel hun vaders als hun echtgenoten aan. Als de mannen elkaar doden, zal het bloed van de ene generatie kleven aan de kinderen en kleinkinderen van de andere. Voor de vrouwen zou zelfs een overwinning betekenen dat zij vaders of echtgenoten verliezen. Ze dringen erop aan dat de mannen hun woede desnoods op hen richten.",
      "De oproep brengt de strijd tot stilstand. De leiders sluiten een verdrag en de twee groepen vormen één gemeenschap. Romulus en Tatius delen het koningschap, met Rome als bestuurscentrum. Zo voert Livius de lezer van een breuk in de gastvrijheid naar een nieuwe politieke ordening. Pas de tussenkomst van degenen die in het begin door anderen werden verplaatst, levert een andere uitkomst op dan de overwinning van één leger."
    ],
    "interpretation": "De scène gebruikt familiebanden om het samengaan van groepen te verklaren. Dat maakt de vrouwen tot politieke actoren binnen het stichtingsverhaal. Tegelijk noemt Livius de moed die ze tonen opvallend voor hun sekse. Beide observaties horen samen. Een beroemd verhaal over handelende vrouwen volstaat op zichzelf niet om te besluiten welke formele macht vrouwen in het vroege Rome bezaten.",
    "figures": [
      "Romulus",
      "Titus Tatius",
      "Sabijnse vrouwen",
      "Sabijnse verwanten",
      "Romeinse mannen"
    ],
    "relations": [
      {
        "from": "Sabijnse vrouwen",
        "to": "Sabijnse verwanten",
        "label": "vragen hun familie de strijd te staken",
        "source": "Titus Livius, Ab urbe condita 1.11–13 (Latijn)"
      },
      {
        "from": "Sabijnse vrouwen",
        "to": "Romeinse mannen",
        "label": "spreken hun echtgenoten aan",
        "source": "Titus Livius, Ab urbe condita 1.11–13 (Latijn)"
      },
      {
        "from": "Titus Tatius",
        "to": "Romulus",
        "label": "deelt het koningschap met",
        "source": "Titus Livius, Ab urbe condita 1.11–13 (Latijn)"
      }
    ],
    "questions": [
      {
        "prompt": "Op welke grond spreken de vrouwen beide partijen aan?",
        "options": [
          "Zij doen een beroep op het burgerrecht van een vierde stad.",
          "Beide groepen zijn langs verschillende kanten hun familie.",
          "Zij claimen een goddelijke voorspelling ontvangen te hebben."
        ],
        "answer": 1,
        "explanation": "In hoofdstuk 13 worden de strijdenden als vaders en echtgenoten, en via de kinderen als familie van elkaar aangesproken."
      },
      {
        "prompt": "Wat volgt uit hun tussenkomst?",
        "options": [
          "Een verdrag, een gezamenlijke gemeenschap en gedeeld koningschap",
          "De verdrijving van Titus Tatius uit Rome",
          "Een verdrag waardoor familiebanden voortaan verboden zijn"
        ],
        "answer": 0,
        "explanation": "Livius verbindt de verzoening rechtstreeks met het delen van de macht in Rome."
      }
    ],
    "essay": {
      "prompt": "Verklaar hoe de interventie van de vrouwen een nieuwe politieke gemeenschap denkbaar maakt.",
      "criteria": [
        "Omschrijf de dubbele positie van de vrouwen.",
        "Toon met een verwijzing naar hun kinderen hoe de indeling vriend/vijand verandert.",
        "Maak onderscheid tussen literaire betekenis en bewijs voor formele macht."
      ]
    }
  },
  {
    "id": "tr-romulus-verdwijnt",
    "tradition": "Romeinse overleveringen",
    "cycle": "De stichting van Rome",
    "title": "Wat gebeurde er met Romulus?",
    "source": [
      {
        "label": "Titus Livius, Ab urbe condita 1.16 (Latijn)",
        "url": "https://www.thelatinlibrary.com/livy/liv.1.shtml"
      },
      {
        "label": "Titus Livius, Ab urbe condita 1.16 (Latijn en Engelse vertaling)",
        "url": "https://adfonteslibrary.org/work-livy-history-1-10"
      }
    ],
    "context": "In Livius 1.16 verdwijnt de stichter op het ogenblik dat hij zijn troepen bijeen heeft. Er ligt geen lichaam dat de aanwezigen kunnen onderzoeken. De schrijver zet verschillende verklaringen naast elkaar en vertelt hoe onzekerheid uitmondt in een openbare verering van Romulus.",
    "narrative": [
      "Tijdens de bijeenkomst bij het zogenoemde Geitenmoeras breekt een onweer los. Een wolk onttrekt de koning aan het zicht. Wanneer de rust weerkeert, staat zijn zetel leeg. Senatoren die dichtbij hadden gestaan verklaren dat een stormvlaag hem heeft meegevoerd. De menigte durft aanvankelijk niet te reageren. Daarna begroeten mensen Romulus als god, als zoon van een god en als vader van de stad.",
      "Livius vermeldt ook een verhaal dat in een andere richting wijst. Sommige mensen zouden al toen hebben gefluisterd dat de senatoren de koning hadden gedood en zijn lichaam hadden uiteengereten. Het politieke probleem is duidelijk. De mensen die het dichtst bij de koning stonden, zijn tegelijk de voornaamste getuigen van wat anderen niet konden zien. Zij genieten als groep geen onbetwistbaar vertrouwen.",
      "Proculus Julius komt met een nieuw relaas. Romulus zou hem na zijn verdwijning zijn verschenen en hem een boodschap hebben meegegeven. Rome zal een groot machtscentrum worden en de Romeinen moeten de militaire traditie onderhouden. Livius noemt de indruk die het optreden van de boodschapper maakte. Daarmee verklaart hij hoe het verhaal ingang vindt, zonder zelf een nieuwe ooggetuige van Romulus' verdwijning te worden."
    ],
    "interpretation": "De drie soorten uitspraken vragen een verschillende lezing. De lege plaats is wat de aanwezigen volgens de vertelling kunnen vaststellen. De senatoren geven een verklaring, anderen verspreiden een verdenking en Proculus brengt een persoonlijke openbaring ter sprake. Livius' relaas is direct bewijs voor de manieren waarop hij onder zijn eigen tijdgenoten over oorsprong en gezag kon schrijven. Voor de historische dood van een achtste-eeuwse koning is het bewijs ontoereikend.",
    "figures": [
      "Romulus",
      "Proculus Julius",
      "Romeinse senatoren"
    ],
    "relations": [
      {
        "from": "Proculus Julius",
        "to": "Romulus",
        "label": "zegt een verschijning te hebben gezien",
        "source": "Titus Livius, Ab urbe condita 1.16 (Latijn)"
      },
      {
        "from": "Romeinse senatoren",
        "to": "Romulus",
        "label": "geven een verklaring voor zijn verdwijning",
        "source": "Titus Livius, Ab urbe condita 1.16 (Latijn)"
      }
    ],
    "questions": [
      {
        "prompt": "Wat kunnen de aanwezigen na het onweer binnen de vertelling vaststellen?",
        "options": [
          "De senatoren hebben de koning vermoord.",
          "De plaats van de koning is leeg.",
          "De boodschap van Proculus is onafhankelijk geverifieerd."
        ],
        "answer": 1,
        "explanation": "De verdwijning is het uitgangspunt. Oorzaken en verklaringen schrijft de tekst aan verschillende stemmen toe."
      },
      {
        "prompt": "Welke rol speelt Proculus?",
        "options": [
          "Hij verklaart de bliksem onschadelijk.",
          "Hij identificeert de dader van een moord.",
          "Hij vertelt over een ontmoeting met de verdwenen koning."
        ],
        "answer": 2,
        "explanation": "Het verhaal van de verschijning geeft Romulus een boodschap voor Rome en bevordert de erkenning van zijn goddelijke status."
      }
    ],
    "essay": {
      "prompt": "Gebruik Livius 1.16 om uit te leggen hoe verschillende verklaringen over één afwezige persoon naast elkaar kunnen bestaan.",
      "criteria": [
        "Onderscheid waarneming, gerucht en gerapporteerde verschijning.",
        "Bespreek de politieke positie van één groep die een verklaring geeft.",
        "Leg uit wat het Romeinse publiek aan de boodschap van Proculus kon hebben."
      ]
    }
  }
];
