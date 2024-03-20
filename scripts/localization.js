var Localization = new function()
{
    const TEXTS = [
        //#region Intro
        {
            id: "locIntroTitle1",
            "en": "Vera and Karel's",
            "cs": "Veřina a Karlova",
            "ru": "Веры и Карела"
        },
        {
            id: "locIntroTitle2",
            "en": "DAUGHTER",
            "cs": "DCERA",
            "ru": "ДОЧЬ"
        },
        {
            id: "locIntroTitle3",
            "en": "was born on June XXth 2024",
            "cs": "se narodila XX. června 2024",
            "ru": "был рождён XX июня 2024 года"
        },
        {
            id: "locIntroGame",
            "en": "To find out her name, please play<br />a little game we designed for her.",
            "cs": "Chete-li se dozvědět její jméno,<br />zahrajte si prosím krátkou hru,<br />kterou jsme pro ni připravili",
            "ru": ""
        },
        {
            id: "locIntroSound",
            "en": "(with the sound on)",
            "cs": "(hrajte se zapnutým zvukem)",
            "ru": ""
        },
        {
            id: "loadingText",
            "en": "LOADING",
            "cs": "NAČÍTÁM",
            "ru": ""
        },
        {
            id: "playText",
            "en": "PLAY",
            "cs": "HRAJTE",
            "ru": ""
        },
        //#endregion

        //#region Tutorial
        {
            id: "locTutorialView",
            "en": "Drag the view down",
            "cs": "Přetáhněte pohled dolů",
            "ru": "",
            "nl": ""
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
            "en": "Placeholder: MMMMMMMMMMMMMM<br />MMMMMMMMMMMMMM<br />MMMMMMMMMMMMMM<br />MMMMMMMMMMMMMM",
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
            "nl": ""
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