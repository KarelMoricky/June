var Localization = new function()
{
    const TEXTS = [
        //#region Intro
        {
            id: "locIntroTitle1",
            "en": "Vera and Karel's",
            "cs": "Veřina a Karlova",
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
            "en": "MMMMMMMMMMMMMM<br />MMMMMMMMMMMMMM<br />MMMMMMMMMMMMMM<br />MMMMMMMMMMMMMM",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile03",
            "en": "Placeholder: We'll hike through forests and hills.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile04",
            "en": "Placeholder: And build castles by the sea.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile05",
            "en": "Placeholder: We'll explore the natural world.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile06",
            "en": "Placeholder: As well as the digital one.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile07",
            "en": "Placeholder: We'll travel to the cold North and watch the polar lights.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile08",
            "en": "Placeholder: Or stay warm in dunes while flying the kites.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile09",
            "en": "Placeholder: We'll see towers that look like rockets,",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile10",
            "en": "Placeholder: And rockets as tall as towers.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile11",
            "en": "Placeholder: At the end of the day, we'll sip a tea,...",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile12",
            "en": "Placeholder: ...and be with our friends.",
            "cs": "",
            "ru": ""
        },
        //#endregion

        //#region Outro
        {
            id: "outroNote",
            "en": "Placeholder: We can't wait to explore the world with you. You are our...",
            "cs": "",
            "ru": "",
        },
        //#endregion

        //#region Credits
        {
            id: "thanks",
            "en": "Thank you for playing!",
            "cs": "Děkujeme za pozornost!",
            "ru": "Спасибо за внимание!",
        },
        {
            id: "credits",
            "en": "Game by <a href=\"https://www.instagram.com/dododollydo/\">Mom</a> and <a href=\"http://moricky.com\">Dad</a>, art&nbsp;by&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\">Jirka</a>, audio&nbsp;by&nbsp;<a href=\"#\">TBD</a>, testing&nbsp;by&nbsp;<a href=\"https://twitter.com/YorisYan\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\">Katka</a>, and&nbsp;<a href=\"https://twitter.com/maruksp\">Marek</a>",
            "cs": "Hra od <a href=\"https://www.instagram.com/dododollydo/\">maminky</a> a <a href=\"http://moricky.com\">tatínka</a>, grafika&nbsp;od&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\">Jirky</a>, zvuky&nbsp;od&nbsp;<a href=\"#\">TBD</a>, testovali&nbsp;<a href=\"https://twitter.com/YorisYan\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\">Katka</a>, a&nbsp;<a href=\"https://twitter.com/maruksp\">Marek</a>",
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

        //--- Refresh buttons
        document.getElementById("languageEN").disabled = m_Language == "en";
        document.getElementById("languageCS").disabled = m_Language == "cs";
        document.getElementById("languageRU").disabled = m_Language == "ru";
    }

    this.Localize = function(element, id = "")
    {
        if (id == "")
            id = element.id;

        for (let i = 0; i < TEXTS.length; i++)
        {
            let container = TEXTS[i];
            if (container.id == id)
                SetText(element, container);
        }
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

    function SetText(element, container)
    {
        let text = container[m_Language];
        if (text == "")
            text = container[DEFAULT_LANGUAGE];

        if (text == "")
            text = `!MISSING STRING: ${container.id}`

        element.innerHTML = text;
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