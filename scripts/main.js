//#region Misc
function CreateElement(type, parent, params = [], isSVG = false)
{
    let nameSpace = isSVG ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml";
    let element = document.createElementNS(nameSpace, type);
    parent.appendChild(element);
    for (let i = 0; i < params.length; i++)
    {
        element.setAttribute(params[i][0], params[i][1]);
    }
    return element;
}

function SetElementVisible(element, isVisible, isRecursive = false)
{
    if (element == null)
    {
        console.warn("Attempting to set visibility to null element!");
        return;
    }
    
    if (isVisible)
        element.classList.remove("hidden");
    else
        element.classList.add("hidden");

    if (isRecursive)
    {
        var children = element.children;
        for (var i = 0; i < children.length; i++)
        {
            SetElementVisible(children[i], isVisible, isRecursive);
        }
    }
}

function IsElementVisible(element)
{
    return !element.classList.contains("hidden");
}

function SetStyleVariable(name, value)
{
    document.querySelector(":root").style.setProperty(name, value);
    Game.GetSVGDoc().querySelector(":root").style.setProperty(name, value);
}

function Vibrate(pattern)
{
    const canVibrate = window.navigator.vibrate;
    if (canVibrate)
        window.navigator.vibrate(pattern);
}

function AnimateWords(element, duration = 3, className = "animatedWord")
{
    const segments = element.innerHTML.split(" ");
    element.innerHTML = "";

    let interval = duration / segments.length;

    let result = [];
    let segment = null;
    for (let i = 0; i < segments.length; i++)
    {
        if (segments[i] == "<br>")
        {
            element.innerHTML += "<br />";
        }
        else
        {
            segment = CreateElement("span", element, [
                ["class", className],
                ["style", `animation-delay: ${interval * i}s; animation-duration: ${interval}`]
            ]);
            segment.innerHTML = segments[i] + "&nbsp;";
            result.push(segment);
        }
    }
    return result;
}

function AnimateLines(element, duration = 3, delay = 0, className = "animatedLine")
{
    const segments = element.innerHTML.split("<br>");
    element.innerHTML = "";

    let interval = duration / segments.length;

    let result = [];
    let segment = null;
    for (let i = 0; i < segments.length; i++)
    {
        if (segments[i] == "<br>")
        {
            element.innerHTML += "<br />";
        }
        else
        {
            segment = CreateElement("p", element, [
                ["class", className],
                ["style", `animation-delay: ${interval * i + delay}s; animation-duration: ${interval}`]
            ]);
            segment.innerHTML = segments[i] + "<br />";
            result.push(segment);
        }
    }
    return result;
}

//#endregion

//#region Audio
/*
var s_LoadAudioOnPlay = false;
function PlayAudio(name)
{
    //--- https://www.w3schools.com/JSREF/dom_obj_audio.asp
    let audio = document.getElementById(name);
    if (audio)
    {
        //--- Some audio failed to load previously, force loading all sounds just in case now
        if (s_LoadAudioOnPlay)
            audio.load();

        audio.currentTime = 0;
        audio.play();
        return audio;
    }
    else
    {
        console.error(`Audio ${name} not found!`);
        return null;
    }
}
function ProcessAudio(audio, timeline, step = 10)
{
    //--- Save indexes of timeline entries
    let indexes = [];
    for (let i = 0; i < timeline.length; i++)
    {
        indexes.push(i);
        if (timeline[i].time >= audio.duration)
            console.warn(`ProcessAudio: Event has time ${timeline[i].time} s, but audio duration is only ${audio.duration} s!`);
    }

    //var backupTime = 0;
    function Tick()
    {
        //--- On iOS, the audio is sometimes ready to play, but stuck. Reload it in such case.
        if ((audio.paused || audio.ended) && audio.readyState == 4)
        {
            audio.load();
            audio.play();
            s_LoadAudioOnPlay = true;
        }

        var currentTime = audio.currentTime;
        /*
        if (backupTime != 0)
            currentTime = backupTime;
        * /

        //--- Process entries
        for (let i = indexes.length - 1; i >= 0; i--)
        {
            const entry = timeline[indexes[i]];
            if (currentTime > entry.time)
            {
                entry.function(currentTime);
                indexes.splice(i, 1);
            }
        }

        //--- Tick again
        if (
                (currentTime < audio.duration && indexes.length > 0) //--- Audio is playing and there are entries remaining
                || currentTime == 0 //--- First frame (in case something goes wrong)
                || (audio.readyState != 4 && audio.networkState != 1) //--- Waiting for the audio to load
        )
        {
            setTimeout(Tick, step);
            /*
            //--- Audio loaded, but failed to play - inititate backup time tracking
            if (audio.paused && audio.readyState == 4)
                backupTime += step / 1000;
            * /
        }
    }
    Tick();
}
*/
//#endregion

//#region Math
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function Lerp(a, b, t)
{
    t = Clamp(t, 0, 1);
	return a * (1 - t) + (b * t);
}

function InvLerp(a, b, v)
{
	return Math.min(Math.max((v - a) / (b - a), 0), 1);
}
function Clamp(value, min, max)
{
    return Math.max(min, Math.min(max, value));
}

function SmoothStep(x)
{
	return x * x * (3 - 2 * x);
}

//--- https://easings.net/
function EaseInOutQuad(x)
{
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function EaseInOutCubic(x)
{
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function EaseInOutQuint(x)
{
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function EaseInOutBack(x)
{
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    
    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

//#endregion