var Localization = new function()
{
    const TEXTS = [
        //#region Intro
        {
            id: "documentTitle",
            "en": "Vera & Karel Had a Girl!",
            "cs": "Vera & Karel mají holčičku!",
            "ru": "У Веры и Карела родилась дочь!"
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
            "en": `was born on June ${m_Today}th 2024`,
            "cs": `se narodila ${m_Today}. června 2024`,
            "ru": `родилась ${m_Today} июня 2024 г.`
        },
        {
            id: "locIntroTitle5",
            "en": "in Haarlem, The Netherlands",
            "cs": "v nizozemském Haarlemu",
            "ru": "в Хаарлеме, Нидерланды"
        },
        {
            id: "playText",
            "en": "PLAY",
            "cs": "HRAJTE",
            "ru": "ИГРАТЬ"
        },
        {
            id: "playDescription",
            "en": "(with sound) to find out her name",
            "cs": "(se zvukem) a zjistěte její jméno",
            "ru": "(со звуком) чтобы узнать её имя"
        },
        //#endregion

        //#region Tutorial
        {
            id: "locTutorialView",
            "en": "Drag the view down",
            "cs": "Přetáhněte pohled dolů",
            "ru": "Переместитесь вниз экрана",
        },
        {
            id: "locTutorialTile1",
            "en": "Bring ",
            "cs": "Přitáhněte ",
            "ru": "Перетащите"
        },
        {
            id: "locTutorialTile2",
            "en": "the baby",
            "cs": "miminko",
            "ru": "малышку"
        },
        {
            id: "locTutorialTile3",
            "en": "to us",
            "cs": "k nám",
            "ru": "к нам"
        },
        //#endregion

        //#region Notes
        {
            id: "note_tile02",
            "en": "Here you are, Little One, <br /> so small, yet so great! <br /> Let's discover what fun <br /> adventures await.",
            "cs": "Ahoj Maličká, <br /> radost naše velká! <br /> Pojďme si vyprávět, <br /> příběh co nás čeká.",
            "ru": "Здравствуй, Счастье. <br /> (Закрываю глаза). <br /> Мне столько нужно тебе сказать. <br /> Показать.",
        },
        {
            id: "note_tile03",
            "en": "Where we are from,  <br /> forests, hills, trails abound. <br /> But for you here, <br /> they'll be a treasure found.",
            "cs": "Odkud máma a táta jsou, <br /> kopců a lesů je fůra. <br /> Ty k nim máš cestu dalekou, <br /> čeká tě pořádná túra.",
            "ru": "Как лохматой лапой свет ловит ель, <br /> Деловито жужжит полосатый шмель, <br /> И как сыч кричит, как ручей поёт, <br /> Как тропа бежит вперёд и вперёд.",
        },
        {
            id: "note_tile04",
            "en": "Beach and sea, however, <br /> you will have nearby, <br /> we'll head there whenever <br /> there is a clear sky.",
            "cs": "Pláž, duny, a moře, <br /> máš tu zase opodál. <br /> Půjdem tam pokaždé, <br /> když je modrá obloha.",
            "ru": "Как седые волны (каждая - громка), <br /> Жадно лижут ступни замка из песка. <br /> И как над донжоном гордо реет флаг: <br /> Если приглядеться, то увидишь, как",
        },
        {
            id: "note_tile05",
            "en": "Feel the ground, smell the air - <br /> nature is everywhere. <br /> Soak up the breathtaking view. <br /> for you can explore it too.",
            "cs": "Rostou, dupou, bují, voní, <br /> najdeš je, krásy přírodní, <br /> Jsou tu všude kolem nás, <br /> sama už je prozkoumáš.",
            "ru": "Там, за горизонтом, пляшут облака, <br /> И как лента вьётся горная река, <br /> И ушами машет добродушный слон. <br /> А малыш-слонёнок спит и видит сон.",
        },
        {
            id: "note_tile06",
            "en": "Build castles in the air - <br /> fantasy's everywhere.  <br /> So let yourself lose, <br /> in worlds that you choose.",
            "cs": "Letí, řádí, neřízené, <br /> najdeš je, krásy smyšlené. <br /> Sama si je vytvoříš, <br /> ve své hlavě je nosíš.",
            "ru": "Сон о бесконечных сказочных мирах: <br /> Феях и драконах, замках в облаках, <br /> Мальчике в чулане, мистере Бобре, <br /> О Кольце Всевластья и о белом дне.",
        },
        {
            id: "note_tile07",
            "en": "The wind blows, and it snows, <br /> but the night is bright. <br /> Go forth far north, <br /> watch the polar lights.",
            "cs": "Vítr vane, neustane, <br /> padající sníh prohání. <br /> Vše si seber a jdi na sever, <br /> sleduj záři polární.",
            "ru": "И у нас с тобою столько впереди!.. <br /> Время приключений, посмотри: <br /> Звёзды и аврора, ночь и тишина, <br /> Снег, сугробы, горы, полная луна.",
        },
        {
            id: "note_tile08",
            "en": "The wind blows, the sand flows, <br /> but summer heat's so sweet. <br /> Hold tight the kite! <br /> Fly, follow its lead.",
            "cs": "Vítr vane, léto plane, <br /> písek zlatě se třpytí. <br /> Drž si draka pěkně zkrátka! <br /> Nebem s tebou poletí.",
            "ru": "Или вереск, дюны и солнцеворот. <br /> Ветер треплет косы. И развернёт <br /> Золотые крылья воздушный змей. <br /> Ты держи его крепче и не робей.",
        },
        {
            id: "note_tile09",
            "en": "More than meets the eye, <br /> a rocket, a tower? <br /> It touches the sky, <br /> let's walk up together!",
            "cs": "Co to čeká nahoře, <br /> raketa nebo věž? <br /> Strmě stoupá k obloze, <br /> na vrchol s námi běž.",
            "ru": "Или телебашня, ели и фуникулёр <br /> (в гору он спешит, весел и так скор). <br /> Затаив дыханье, посмотришь вниз, <br /> А там сонный город, в тумане сиз.",
        },
        {
            id: "note_tile10",
            "en": "Waiting, ready for launch,  <br /> a tower, a rocket? <br /> Waiting for us to watch, <br /> or to be your ticket?",
            "cs": "Ke startu připravena, <br /> věž nebo raketa? <br /> Vydá se vzhůru sama, <br /> či s tebou odlétá?",
            "ru": "Или космодром, обратный отсчёт. <br /> И вот ракета пошла на взлёт. <br /> Куда она тебя унесёт? <br /> Ввысь и вперёд, ввысь и вперёд.",
        },
        {
            id: "note_tile11",
            "en": "Adventures await, <br /> there's so many of them. <br /> Remember to rest, <br /> they'll find you soon again.",
            "cs": "Příběh co nás čeká. <br /> A čekat může dál. <br /> Pohoda. Klid. <br /> Kdo by kam spěchal?",
            "ru": "Ну а может, всё же, скорей домой? <br /> Чашка ‘кофе’ (чая?), и мы с тобой. <br /> Смех, улыбки, слёзы, объятий круг. <br /> Каждый миг бесценен. И мир вокруг.",
        },
        {
            id: "note_tile12",
            "en": "Life awaits. <br /> This is where it starts. <br /> With you, with us, <br /> With love in our hearts.",
            "cs": "Láska co nás čeká, <br /> tady a teď začíná, <br /> Mezi hvězdami. <br /> V našich srdcích spočívá.",
            "ru": "Здравствуй, Счастье. <br /> (Открываю глаза). <br /> Нам столько нужно тебе сказать. <br /> Показать.",
        },
        //#endregion

        //#region Outro
        {
            id: "outroNote",
            "en": "Your name is music, <br /> it dots the night sky. <br /> You are our girl, …",
            "cs": "Tahle hra je pro tebe, <br /> Jméno své znáš z nebe. <br /> Jsi naše…",
            "ru": "Мы очень тебя ждали. <br /> Добро пожаловать в этот мир, <br /> Наша…",
        },
        {
            id: "outroName",
            "en": "LYRA",
            "cs": "LYRA",
            "ru": "ЛИРА",
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
            "en": "Game by <a href=\"https://www.instagram.com/dododollydo/\" target=\"_blank\">Mom</a> and <a href=\"http://moricky.com\" target=\"_blank\">Dad</a>, game art&nbsp;by&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\" target=\"_blank\">Jirka</a>, cover&nbsp;art&nbsp;by&nbsp;<a href=\"https://www.instagram.com/august.ro/\" target=\"_blank\">August.ro</a>, testing&nbsp;by&nbsp;<a href=\"https://twitter.com/YorisYan\" target=\"_blank\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\" target=\"_blank\">Katka</a>, <a href=\"https://twitter.com/maruksp\" target=\"_blank\">Marek</a>, and&nbsp;<a href=\"https://www.instagram.com/flufflekek/\" target=\"_blank\">Olga</a>.<br /><a href=\"https://github.com/KarelMoricky/June\" target=\"_blank\">Handcrafted</a> without AI.",
            "cs": "Hra od <a href=\"https://www.instagram.com/dododollydo/\" target=\"_blank\">maminky</a> a <a href=\"http://moricky.com\" target=\"_blank\">tatínka</a>, grafika&nbsp;hry&nbsp;od&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\" target=\"_blank\">Jirky</a>, grafika&nbsp;oznámení&nbsp;od&nbsp;<a href=\"https://www.instagram.com/august.ro/\" target=\"_blank\">August.ro</a>, testovali&nbsp;<a href=\"https://twitter.com/YorisYan\" target=\"_blank\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\" target=\"_blank\">Katka</a>, <a href=\"https://twitter.com/maruksp\" target=\"_blank\">Marek</a>, a&nbsp;<a href=\"https://www.instagram.com/flufflekek/\" target=\"_blank\">Olga</a>.<br /><a href=\"https://github.com/KarelMoricky/June\" target=\"_blank\">Vytvořeno ručně</a> bez pomoci AI.",
            "ru": "Игру сделали <a href=\"https://www.instagram.com/dododollydo/\" target=\"_blank\">мама</a> и <a href=\"http://moricky.com\" target=\"_blank\">папа</a>, иллюстрации&nbsp;-&nbsp;<a href=\"https://www.behance.net/mikovecjir5bc4\" target=\"_blank\">Jirka</a>, иллюстрация обложки&nbsp;-&nbsp;<a href=\"https://www.instagram.com/august.ro/\" target=\"_blank\">August.ro</a>, тестирование&nbsp;-&nbsp;<a href=\"https://twitter.com/YorisYan\" target=\"_blank\">Joris</a>, <a href=\"https://www.instagram.com/katacik/\" target=\"_blank\">Katka</a>, <a href=\"https://twitter.com/maruksp\" target=\"_blank\">Marek</a> и <a href=\"https://www.instagram.com/flufflekek/\" target=\"_blank\">Ольга</a>.<br /><a href=\"https://github.com/KarelMoricky/June\" target=\"_blank\">Игра сделана</a> без использования ИИ.",
        },
        {
            id: "locGameSelection",
            "en": "Try a game for her older brother →",
            "cs": "Zkuste hru pro jejího staršího bratra →",
            "ru": "Сыграйте в игру, сделанную для её старшего брата",
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

        //--- Decrease note font size in Russian to fit slightly longer texts
        if (language == "ru")
            document.getElementById("note").classList.add("noteText_ru");
        else
            document.getElementById("note").classList.remove("noteText_ru");
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