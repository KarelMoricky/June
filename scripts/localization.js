var Localization = new function()
{
    const TEXTS = [
        //#region Intro
        {
            id: "documentTitle",
            "en": "Vera & Karel had a girl!",
            "cs": "Vera & Karel mají holčičku!",
            "ru": ""
        },
        {
            id: "locIntroTitle1",
            "en": "Vera & Karel's",
            "cs": "Veřina & Karlova",
            "ru": " "
        },
        {
            id: "locIntroTitle2",
            "en": "DAUGHTER",
            "cs": "DCERA",
            "ru": "ДОЧЬ"
        },
        {
            id: "locIntroTitle3",
            "en": " ",
            "cs": " ",
            "ru": "Веры и Карела"
        },
        {
            id: "locIntroTitle4",
            "en": "was born on June XXth 2024",
            "cs": "se narodila XX. června 2024",
            "ru": "был рождён XX июня 2024 года"
        },
        {
            id: "playText",
            "en": "PLAY",
            "cs": "HRAJTE",
            "ru": ""
        },
        {
            id: "playDescription",
            "en": "(with sound) to find out her name",
            "cs": "(se zvukem) a zjistěte její jméno",
            "ru": ""
        },
        //#endregion

        //#region Tutorial
        {
            id: "locTutorialView",
            "en": "Drag the view down",
            "cs": "Přetáhněte pohled dolů",
            "ru": "",
        },
        {
            id: "locTutorialTile1",
            "en": "Bring the baby",
            "cs": "Přitáhněte miminko",
            "ru": ""
        },
        {
            id: "locTutorialTile2",
            "en": "to us",
            "cs": "k nám",
            "ru": ""
        },
        //#endregion

        //#region Notes
        {
            id: "note_tile02",
            "en": "Here you are, Little One, <br /> so small, yet so great! <br /> Let's discover what fun <br /> adventures await.",
            "cs": "Ahoj Maličká, <br /> radost naše velká! <br /> Pojďme si prohlédout, <br /> příběh co nás čeká.",
            "ru": ""
        },
        {
            id: "note_tile03",
            "en": "Where we are from,  <br /> forests, hills, trails abound. <br /> But for you here, <br /> they'll be a treasure found.",
            "cs": "Odkud máma a táta jsou, <br /> kopců a lesů je fůra. <br /> Ty k nim máš cestu dalekou, <br /> čeká tě pořádná túra.",
            "ru": ""
        },
        {
            id: "note_tile04",
            "en": "Beach and sea, however, <br /> you will have nearby, <br /> we'll head there whenever <br /> there is a clear sky.",
            "cs": "Pláž, duny, a moře, <br /> máš tu zase opodál. <br /> Půjdeme tam pokaždé, <br /> když je modrá obloha.",
            "ru": ""
        },
        {
            id: "note_tile05",
            "en": "Feel the ground, smell the air - <br /> nature is everywhere. <br /> Soak up the breathtaking view. <br /> for you can explore it too.",
            "cs": "Rostou, dupou, bují, voní, <br /> najdeš je, krásy přírodní, <br /> Jsou tu všude kolem nás, <br /> sama je už prozkoumáš.",
            "ru": ""
        },
        {
            id: "note_tile06",
            "en": "Build castles in the air - <br /> fantasy's everywhere.  <br /> So let yourself lose, <br /> in worlds that you choose."
            "cs": "Letí, řádí, neřízené, <br /> najdeš je, krásy smyšlené. <br /> Sama si je vytvoříš, <br /> ve své hlavě je nosíš.",
            "ru": ""
        },
        {
            id: "note_tile07",
            "en": "The wind blows, and it snows, <br /> but the night is bright. <br /> Go forth far north, <br /> watch the polar lights.",
            "cs": "Vítr vane, neustane,<br /> padající sníh prohání.<br /> Vše si seber a jdi na sever, <br /> sleduj záři polární.",
            "ru": ""
        },
        {
            id: "note_tile08",
            "en": "The wind blows, the sand flows, <br /> but summer heat's so sweet. <br /> Hold tight the kite! <br /> Fly, follow its lead.",
            "cs": "Vítr vane, léto plane, <br /> písek zlatě se třpytí. <br /> Drž si draka pěkně zkrátka! <br /> Nebem s tebou poletí.",
            "ru": ""
        },
        {
            id: "note_tile09",
            "en": "More than meets the eye, <br /> a rocket, a tower? <br /> It touches the sky, <br /> let's walk up together!",
            "cs": "Co to čeká nahoře, <br /> raketa nebo věž? <br /> Strmě stoupá k obloze, <br /> vzhůru k ní s námi běž.",
            "ru": ""
        },
        {
            id: "note_tile10",
            "en": "Waiting, ready for launch,  <br /> a tower, a rocket? <br /> Waiting for us to watch, <br /> or to be your ticket?",
            "cs": "Připravena ke startu, <br /> věž nebo raketa? <br /> Je pouze jednou z mnoha, <br /> či s tebou odlétá?",
            "ru": ""
        },
        {
            id: "note_tile11",
            "en": "Adventures await, <br /> and when you're done with them, <br /> remember to rest. <br /> You'll jump back soon again.",
            "cs": "Příběh co nás čeká. <br /> A čekat může dál. <br /> Pohoda. Klid. <br /> Kdo by kam spěchal?",
            "ru": ""
        },
        {
            id: "note_tile12",
            "en": "Life awaits. <br /> This is where it starts. <br /> With you, with us, <br /> With love in our hearts.",
            "cs": "",
            "ru": ""
        },
        //#endregion

        //#region Outro
        {
            id: "outroNote",
            "en": "Your name is music, <br /> it dots the night sky. <br /> You are our girl, you are...",
            "cs": "Tahle hra je pro tebe, <br /> Jméno své znáš z nebe. <br /> Jsi naše...",
            "ru": "",
        },
        //#endregion

        //#region Credits
        {
            id: "thanks",
            "en": "Thank you for playing!",
            "cs": "Děkujeme za hraní!",
            "ru": "Спасибо за внимание!",
        },
        {
            id: "credits",
            "en": "Game by <a href=\"https://www.instagram.com/dododollydo/\">Mom</a> and <a href=\"http://moricky.com\">Dad</a>, art&nbsp;by&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\">Jirka</a>, audio&nbsp;by&nbsp;<a href=\"#\">TBD</a>, testing&nbsp;by&nbsp;<a href=\"https://twitter.com/YorisYan\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\">Katka</a>, and&nbsp;<a href=\"https://twitter.com/maruksp\">Marek</a>.<br /><a href=\"https://github.com/KarelMoricky/June\">Handcrafted</a> without AI.",
            "cs": "Hra od <a href=\"https://www.instagram.com/dododollydo/\">maminky</a> a <a href=\"http://moricky.com\">tatínka</a>, grafika&nbsp;od&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\">Jirky</a>, zvuky&nbsp;od&nbsp;<a href=\"#\">TBD</a>, testovali&nbsp;<a href=\"https://twitter.com/YorisYan\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\">Katka</a>, a&nbsp;<a href=\"https://twitter.com/maruksp\">Marek</a>.<br /><a href=\"https://github.com/KarelMoricky/June\">Vytvořeno ručně</a> bez pomoci AI.",
            "ru": "",
        },
        //#endregion

        /* TEMPLATE
        {
            id: "",
            "en": "",
            "cs": "",
            "ru": ""
        },
        */
    ]

    //#region System
    this.SetLanguage = function(language = "", refreshAll = false)
    {
        if (language == "")
        {
            const urlParams = new URLSearchParams(window.location.search);
            language = urlParams.get("language");
            if (!language)
                language = DEFAULT_LANGUAGE;
        }

        m_Language = language;

        if (refreshAll)
        {
            RefreshDocument(document);
            RefreshDocument(Game.GetSVGDoc());

            const introBox = document.getElementById("introBox");
            introBox.classList.remove("introBoxRefresh");
            setTimeout(() => {
                introBox.classList.add("introBoxRefresh");
            }, 0.1);
        }

        //--- Set page title
        document.title =  GetText(GetContainer("documentTitle"));

        //--- Refresh buttons
        document.getElementById("languageEN").disabled = m_Language == "en";
        document.getElementById("languageCS").disabled = m_Language == "cs";
        document.getElementById("languageRU").disabled = m_Language == "ru";
    }

    this.Localize = function(element, id = "")
    {
        if (id == "")
            id = element.id;

        SetText(element, GetContainer(id));
    }

    function RefreshDocument(parent)
    {
        if (!parent)
            return;

        for (let i = 0; i < TEXTS.length; i++)
        {
            let container = TEXTS[i];
            let element = parent.getElementById(container.id);
            if (element)
                SetText(element, container);
        }
    }

    function GetContainer(id)
    {
        for (let i = 0; i < TEXTS.length; i++)
        {
            let container = TEXTS[i];
            if (container.id == id)
                return container;
        }
        return null;
    }

    function GetText(container)
    {
        let text = container[m_Language];
        if (text == "")
            text = container[DEFAULT_LANGUAGE];

        if (text == "")
            text = `!MISSING STRING: ${container.id}`;

        return text;
    }

    function SetText(element, container)
    {
        element.innerHTML = GetText(container);
    }

    //--- Init
    let m_Language = "";

    this.SetLanguage();
    RefreshDocument(document);
    
    window.addEventListener(EVENT_GAME_INIT,() => {
        RefreshDocument(Game.GetSVGDoc());
    });

    //--- Buttons
    SetElementVisible(document.getElementById("languageBox"), true);
    document.getElementById("languageEN").addEventListener("click", () => {
        this.SetLanguage("en", true);
    });
    document.getElementById("languageCS").addEventListener("click", () => {
        this.SetLanguage("cs", true);
    });
    document.getElementById("languageRU").addEventListener("click", () => {
        this.SetLanguage("ru", true);
    });

    //#endregion
}