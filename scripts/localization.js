var Localization = new function()
{
    const TEXTS = [
        //#region Intro
        {
            id: "locIntroTitle1",
            "en": "Vera and Karel's",
            "cs": "Veřin a Karlův",
            "ru": "Веры и Карела"
        },
        {
            id: "titleBaby",
            "en": "YOUNGER SON",
            "cs": "MLADŠÍ SYN",
            "ru": "МЛАДШИЙ СЫН"
        },
        {
            id: "locIntroTitle2",
            "en": "was born on June XXth 2024",
            "cs": "se narodil XX. června 2024",
            "ru": "был рождён XX июня 2024 года"
        },
        {
            id: "locIntroGame",
            "en": "To find out his name, please play<br />a little game we designed for him.",
            "cs": "Chete-li se dozvědět jeho jméno,<br />zahrajte si prosím krátkou hru,<br />kterou jsme pro něj připravili",
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
            "cs": "Přetáhněte miminko",
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
            "en": "Placeholder: Hello little one, we are your parents. Who are you? Who will you be?",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile03",
            "en": "Placeholder: Maybe you will make games like dad.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile04",
            "en": "Placeholder: Or you will sing beautifully like mom.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile05",
            "en": "Placeholder: Perhaps you will become a fotballer.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile06",
            "en": "Placeholder: You could navigate space junk as an astronaut.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile07",
            "en": "Placeholder: Or Earth junk as a gabage collector.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile08",
            "en": "Placeholder: Maybe you will follow the path of your grandparents and become and engineer.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile09",
            "en": "Placeholder: Or dive deep to research oceans as a marine biologist.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile10",
            "en": "Placeholder: You could be herding sheep together with Marcy.",
            "cs": "",
            "ru": ""
        },
        {
            id: "note_tile11",
            "en": "Placeholder: Or become a barista to prepare the best coffee.",
            "cs": "",
            "ru": ""
        },
        //#endregion

        //#region Outro
        {
            id: "locOutro",
            "en": "No matter what will you become,<br />we will always love you. You are our...",
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
        }

        //--- Refresh buttons
        document.getElementById("languageEN").disabled = m_Language == "en";
        document.getElementById("languageCS").disabled = m_Language == "cs";
        document.getElementById("languageRU").disabled = m_Language == "ru";
    }

    // this.RefreshElement = function(element, id = "")
    // {
    //     if (id == "")
    //         id = element.id;

    //     for (let i = 0; i < TEXTS.length; i++)
    //     {
    //         let container = TEXTS[i];
    //         if (container.id == id)
    //             SetText(element, container);
    //     }
    // }

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