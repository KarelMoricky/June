const ID_INTRO_AREA = "introArea";
const ID_INTRO_BOX = "introBox";
const ID_BUTTON_PLAY = "playButton";
const ID_TIER_0_SEX = "titleBaby";

var m_IntroArea = null;
var m_IntroBox = null;

window.addEventListener("load", OnLoadIntroBox);
function OnLoadIntroBox()
{
    m_IntroArea = document.getElementById(ID_INTRO_AREA);
    m_IntroBox = document.getElementById(ID_INTRO_BOX);

    let playButton = document.getElementById(ID_BUTTON_PLAY);
    playButton.addEventListener("click", OnButtonPlay);

    if (Debug.IsDev())
    {
        //--- Instantly skip the loading screen
        if (Debug.SkipIntro())
            OnButtonPlay();

        let tier0_sex = document.getElementById(ID_TIER_0_SEX);
        tier0_sex.addEventListener("click", OnTier0Sex);
    }

    function OnButtonPlay()
    {
        SetElementVisible(m_IntroArea, false);

        //--- Switch to fullscreen
        if (!Debug.SkipIntro())
        {
            Vibrate(VIBRATION_PLAY);

            let docElm = document.documentElement;
            if (docElm.requestFullscreen)
                docElm.requestFullscreen();
            else if (docElm.mozRequestFullScreen)
                docElm.mozRequestFullScreen();
            else if (docElm.webkitRequestFullScreen)
                docElm.webkitRequestFullScreen();
            else if (docElm.msRequestFullscreen)
                docElm.msRequestFullscreen();
        }

        let ev = new CustomEvent(EVENT_PAUSE,{detail: {
            isPaused: false
        }});
        window.dispatchEvent(ev);
    }

    function OnTier0Sex(ev)
    {
        let tier0_sex = document.getElementById(ID_TIER_0_SEX);
        if (tier0_sex.innerHTML == "DAUGHTER")
            tier0_sex.innerHTML = "YOUNGER SON";
        else
          tier0_sex.innerHTML = "DAUGHTER";
    }
}